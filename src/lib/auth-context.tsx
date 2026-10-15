'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, School } from '@/types/chemical';
import { SEED_SCHOOLS } from '@/lib/seed-data';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  schoolId: string;
  schoolName: string;
  permissions: {
    canScanReagents: boolean;
    canLogIncidents: boolean;
    canAuthorizeDisposal: boolean;
    canManageDistrictFleet: boolean;
    canCertifyAuditLog: boolean;
    canAccessCopilot: boolean;
  };
}

export const PRESET_USERS: Record<string, UserProfile> = {
  teacher: {
    id: 'user-teacher-01',
    name: 'R. Selvakumar, M.Sc.',
    email: 'selvakumar.chem@tnschools.gov.in',
    role: 'teacher',
    designation: 'Senior PGT Chemistry & Lab Custodian',
    schoolId: 'school-1',
    schoolName: 'Govt Higher Secondary School, Pollachi West',
    permissions: {
      canScanReagents: true,
      canLogIncidents: true,
      canAuthorizeDisposal: false, // Disposal overrides must be signed off by Principal
      canManageDistrictFleet: false,
      canCertifyAuditLog: false,
      canAccessCopilot: true,
    },
  },
  principal: {
    id: 'user-principal-02',
    name: 'Dr. K. Meenakshi, Ph.D.',
    email: 'principal.madukkarai@tnschools.gov.in',
    role: 'principal',
    designation: 'Headmistress & Institutional Safety Authority',
    schoolId: 'school-3',
    schoolName: 'Madukkarai Community High School',
    permissions: {
      canScanReagents: true,
      canLogIncidents: true,
      canAuthorizeDisposal: true, // Has authority to approve Level 2 HITL disposals
      canManageDistrictFleet: false,
      canCertifyAuditLog: true,
      canAccessCopilot: true,
    },
  },
  district_officer: {
    id: 'user-deo-03',
    name: 'Er. S. Murugesan, M.Tech (Env)',
    email: 'deo.hazmat.cbe@tn.gov.in',
    role: 'district_officer',
    designation: 'District Education Officer & Hazmat Incident Commander',
    schoolId: 'all',
    schoolName: 'Coimbatore District Educational Directorate',
    permissions: {
      canScanReagents: true,
      canLogIncidents: true,
      canAuthorizeDisposal: true,
      canManageDistrictFleet: true, // Controls hazmat route pickup & pooling
      canCertifyAuditLog: true,
      canAccessCopilot: true,
    },
  },
};

import { 
  supabase, 
  supabaseSignUp, 
  supabaseSignIn, 
  supabaseSignOut, 
  supabaseGetUserProfile 
} from '@/lib/supabase';

interface AuthContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  loginAsRole: (role: 'teacher' | 'principal' | 'district_officer') => void;
  loginWithCredentials: (identifier: string, password?: string, role?: UserRole, schoolId?: string) => Promise<boolean> | boolean;
  loginWithOtp: (email: string, otp: string, role: UserRole, schoolId?: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, role: UserRole, schoolId: string, username?: string) => Promise<boolean> | boolean;
  logout: () => void;
  can: (permission: keyof UserProfile['permissions']) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(PRESET_USERS.teacher);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load persisted session on mount & subscribe to Supabase Auth
  useEffect(() => {
    try {
      const stored = localStorage.getItem('reagentwatch_auth_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.role) {
          setCurrentUser(parsed);
          setIsAuthenticated(true);
        }
      }
    } catch {}

    // Check live Supabase Session
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          supabaseGetUserProfile(data.session.user.id).then(profile => {
            if (profile) {
              const role = (profile.role as UserRole) || 'teacher';
              const matchedSchool = SEED_SCHOOLS.find(s => s.id === profile.school_id) || SEED_SCHOOLS[0];
              let basePerms = PRESET_USERS.teacher.permissions;
              if (role === 'principal') basePerms = PRESET_USERS.principal.permissions;
              else if (role === 'district_officer') basePerms = PRESET_USERS.district_officer.permissions;

              setCurrentUser({
                id: profile.id,
                name: profile.name || data.session.user.email?.split('@')[0].toUpperCase(),
                email: profile.email || data.session.user.email || '',
                role,
                designation: role === 'principal' ? 'Headmaster / Principal' : role === 'district_officer' ? 'District Hazmat Coordinator' : 'Senior Chemistry Faculty',
                schoolId: role === 'district_officer' ? 'all' : matchedSchool.id,
                schoolName: role === 'district_officer' ? 'Coimbatore District Educational Directorate' : matchedSchool.name,
                permissions: basePerms,
              });
              setIsAuthenticated(true);
            }
          });
        }
      });
    }
  }, []);

  const loginAsRole = (roleKey: 'teacher' | 'principal' | 'district_officer') => {
    const user = PRESET_USERS[roleKey];
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('reagentwatch_auth_user', JSON.stringify(user));
      } catch {}
    }
  };

  const loginWithCredentials = async (
    identifier: string, 
    password?: string, 
    role?: UserRole, 
    schoolId?: string
  ): Promise<boolean> => {
    const isEmail = identifier.includes('@');
    const email = isEmail ? identifier.trim() : `${identifier.trim()}@tn.gov.in`;
    const targetRole = role || (identifier.toLowerCase().includes('principal') ? 'principal' : identifier.toLowerCase().includes('deo') ? 'district_officer' : 'teacher');

    // 1. Supabase Auth backend call if password provided
    if (supabase && password) {
      try {
        await supabaseSignIn(email, password);
      } catch (err) {
        console.warn('Supabase sign in warning:', err);
      }
    }

    const lowerId = identifier.toLowerCase();
    if (lowerId.includes('selvakumar') || (targetRole === 'teacher' && lowerId.includes('teacher'))) {
      loginAsRole('teacher');
      return true;
    }
    if (lowerId.includes('meenakshi') || lowerId.includes('headmaster') || (targetRole === 'principal' && lowerId.includes('principal'))) {
      loginAsRole('principal');
      return true;
    }
    if (lowerId.includes('murugesan') || (targetRole === 'district_officer' && (lowerId.includes('deo') || lowerId.includes('district')))) {
      loginAsRole('district_officer');
      return true;
    }

    const matchedSchool = SEED_SCHOOLS.find(s => s.id === schoolId) || SEED_SCHOOLS[0];
    
    let basePerms = PRESET_USERS.teacher.permissions;
    if (targetRole === 'principal') basePerms = PRESET_USERS.principal.permissions;
    else if (targetRole === 'district_officer') basePerms = PRESET_USERS.district_officer.permissions;

    const customUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: identifier.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email,
      role: targetRole,
      designation: targetRole === 'principal' ? 'Headmaster / Principal' : targetRole === 'district_officer' ? 'District Hazmat Coordinator' : 'Laboratory Science Teacher',
      schoolId: targetRole === 'district_officer' ? 'all' : matchedSchool.id,
      schoolName: targetRole === 'district_officer' ? 'Coimbatore District Directorate' : matchedSchool.name,
      permissions: basePerms,
    };

    setCurrentUser(customUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('reagentwatch_auth_user', JSON.stringify(customUser));
    } catch {}
    return true;
  };

  const loginWithOtp = async (
    email: string, 
    otp: string, 
    role: UserRole, 
    schoolId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { verifyOtpCode } = await import('@/lib/supabase');
    const res = await verifyOtpCode(email, otp);
    if (!res.success) {
      return { success: false, error: res.error || 'Invalid OTP code' };
    }

    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes('selvakumar') || (role === 'teacher' && lowerEmail.includes('teacher'))) {
      loginAsRole('teacher');
      return { success: true };
    }
    if (lowerEmail.includes('meenakshi') || lowerEmail.includes('headmaster') || (role === 'principal' && lowerEmail.includes('principal'))) {
      loginAsRole('principal');
      return { success: true };
    }
    if (lowerEmail.includes('murugesan') || (role === 'district_officer' && (lowerEmail.includes('deo') || lowerEmail.includes('district')))) {
      loginAsRole('district_officer');
      return { success: true };
    }

    const matchedSchool = SEED_SCHOOLS.find(s => s.id === schoolId) || SEED_SCHOOLS[0];
    let basePerms = PRESET_USERS.teacher.permissions;
    if (role === 'principal') basePerms = PRESET_USERS.principal.permissions;
    else if (role === 'district_officer') basePerms = PRESET_USERS.district_officer.permissions;

    const customUser: UserProfile = {
      id: res.user?.id || `user-${Date.now()}`,
      name: res.user?.name || email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
      email,
      role,
      designation: role === 'principal' ? 'Headmaster / Principal' : role === 'district_officer' ? 'District Hazmat Incident Commander' : 'Senior Chemistry Faculty',
      schoolId: role === 'district_officer' ? 'all' : matchedSchool.id,
      schoolName: role === 'district_officer' ? 'Coimbatore District Educational Directorate' : matchedSchool.name,
      permissions: basePerms,
    };

    setCurrentUser(customUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('reagentwatch_auth_user', JSON.stringify(customUser));
    } catch {}
    return { success: true };
  };

  const signUp = async (
    name: string, 
    email: string, 
    password: string, 
    role: UserRole, 
    schoolId: string, 
    username?: string
  ): Promise<boolean> => {
    // 1. Supabase Auth & Users table insertion
    if (supabase) {
      try {
        await supabaseSignUp(name, email, password, role, schoolId, username);
      } catch (err) {
        console.warn('Supabase signup warning:', err);
      }
    }

    const matchedSchool = SEED_SCHOOLS.find(s => s.id === schoolId) || SEED_SCHOOLS[0];

    let basePerms = PRESET_USERS.teacher.permissions;
    if (role === 'principal') basePerms = PRESET_USERS.principal.permissions;
    else if (role === 'district_officer') basePerms = PRESET_USERS.district_officer.permissions;

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      designation: role === 'principal' ? 'School Headmaster' : role === 'district_officer' ? 'District Safety Officer' : 'Science Teacher / Lab Assistant',
      schoolId: role === 'district_officer' ? 'all' : matchedSchool.id,
      schoolName: role === 'district_officer' ? 'District Educational Command' : matchedSchool.name,
      permissions: basePerms,
    };

    setCurrentUser(newUser);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('reagentwatch_auth_user', JSON.stringify(newUser));
    } catch {}
    return true;
  };

  const logout = () => {
    if (supabase) {
      supabaseSignOut();
    }
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('reagentwatch_auth_user');
    } catch {}
  };

  const can = (permission: keyof UserProfile['permissions']) => {
    if (!isAuthenticated) return false;
    return !!currentUser.permissions[permission];
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        loginAsRole,
        loginWithCredentials,
        loginWithOtp,
        signUp,
        logout,
        can,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
