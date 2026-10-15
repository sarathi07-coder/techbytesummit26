-- ============================================================================
-- REAGENTWATCH AI: PRODUCTION SUPABASE POSTGRESQL SCHEMA + SEED DATA
-- Target Supabase Host: db.dwudshdnabfaqohlphoc.supabase.co
-- Target Database: postgres (Port 5432)
-- Copy and run this entire file in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dwudshdnabfaqohlphoc/sql
-- ============================================================================

-- 0. Enable UUID and Vector Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CLEAN DROP OLD TABLES (Resolves character varying vs uuid mismatch: Error 42804)
-- ============================================================================
DROP TABLE IF EXISTS system_evaluations CASCADE;
DROP TABLE IF EXISTS cluster_disposal_pools CASCADE;
DROP TABLE IF EXISTS reagent_transfers CASCADE;
DROP TABLE IF EXISTS langgraph_authorizations CASCADE;
DROP TABLE IF EXISTS storage_incompatibilities CASCADE;
DROP TABLE IF EXISTS sds_knowledge_base CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS degradation_events CASCADE;
DROP TABLE IF EXISTS chemical_bottles CASCADE;
DROP TABLE IF EXISTS storage_locations CASCADE;
DROP TABLE IF EXISTS chemicals_master CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- 1. Create or Replace Custom ENUM Types safely
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('teacher', 'principal', 'district_officer', 'auditor');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bottle_status_enum AS ENUM ('sealed', 'opened', 'degraded', 'quarantined', 'disposed', 'transferred');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('safe', 'low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_status_enum AS ENUM ('raised', 'acknowledged', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE peroxide_class_enum AS ENUM ('none', 'class_a_severe', 'class_b_concentration_hazard', 'class_c_polymerizers');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type_enum AS ENUM (
        'routine_inspection',
        'visual_crystals',
        'swollen_cap',
        'color_change',
        'precipitation',
        'container_crack_leak',
        'pungent_odor',
        'humidity_caking',
        'fridge_power_cut',
        'quantity_anomaly'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE hitl_status_enum AS ENUM ('pending_principal_approval', 'approved', 'rejected', 'executed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. TABLE DEFINITIONS (All IDs harmonized to VARCHAR(100))
-- ============================================================================

-- A. Schools Table (Geospatial & Telemetry Details)
CREATE TABLE schools (
    id VARCHAR(100) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude DECIMAL(9, 6) NOT NULL,
    longitude DECIMAL(9, 6) NOT NULL,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(150),
    power_cut_frequency_weekly INT DEFAULT 2,
    avg_lab_humidity_pct INT DEFAULT 65,
    risk_grade VARCHAR(10) DEFAULT 'B',
    last_audit_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. Users Table (Separate Logins, OTP Verification & School Association)
CREATE TABLE users (
    id VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) UNIQUE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    phone VARCHAR(30),
    role user_role_enum NOT NULL DEFAULT 'teacher',
    designation VARCHAR(150),
    school_id VARCHAR(100) REFERENCES schools(id) ON DELETE SET NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    otp_code VARCHAR(10) DEFAULT '123456',
    otp_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '24 hours'),
    email_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. Storage Locations (Shelf / Cabinet / Room hierarchy)
CREATE TABLE storage_locations (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    cabinet_name VARCHAR(100) NOT NULL,
    shelf_number VARCHAR(50) NOT NULL,
    is_ventilated BOOLEAN DEFAULT FALSE,
    is_cold_storage BOOLEAN DEFAULT FALSE,
    temp_celsius DECIMAL(4, 1) DEFAULT 28.0,
    humidity_pct INT DEFAULT 70,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- D. Chemicals Master Catalog (PubChem, GHS, Incompatibility Rules)
CREATE TABLE chemicals_master (
    id VARCHAR(100) PRIMARY KEY,
    cas_number VARCHAR(30) UNIQUE NOT NULL,
    canonical_name VARCHAR(255) NOT NULL,
    iupac_name VARCHAR(255),
    chemical_formula VARCHAR(100),
    pubchem_cid INT,
    ghs_classes TEXT[] NOT NULL,
    peroxide_former_class peroxide_class_enum DEFAULT 'none',
    is_hygroscopic BOOLEAN DEFAULT FALSE,
    is_light_sensitive BOOLEAN DEFAULT FALSE,
    max_shelf_life_days INT NOT NULL DEFAULT 1095,
    post_open_shelf_life_days INT NOT NULL DEFAULT 180,
    storage_compatibility_group VARCHAR(50) NOT NULL,
    safe_handling_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- E. Chemical Bottles (Physical Reagents Tracked via QR Code)
CREATE TABLE chemical_bottles (
    id VARCHAR(100) PRIMARY KEY,
    qr_code VARCHAR(100) UNIQUE NOT NULL,
    school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    location_id VARCHAR(100) REFERENCES storage_locations(id) ON DELETE SET NULL,
    chemical_id VARCHAR(100) NOT NULL REFERENCES chemicals_master(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    manufacturer VARCHAR(150),
    initial_volume_ml DECIMAL(8, 2) NOT NULL,
    current_volume_ml DECIMAL(8, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'ml',
    received_date DATE NOT NULL,
    opened_date DATE,
    expiry_date DATE NOT NULL,
    status bottle_status_enum NOT NULL DEFAULT 'sealed',
    current_risk_score INT DEFAULT 0,
    risk_level risk_level_enum DEFAULT 'safe',
    risk_factors JSONB DEFAULT '[]'::JSONB,
    last_inspected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- F. Degradation Events & Telemetry
CREATE TABLE degradation_events (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    bottle_id VARCHAR(100) NOT NULL REFERENCES chemical_bottles(id) ON DELETE CASCADE,
    reported_by_user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    event_type event_type_enum NOT NULL,
    voice_note_text TEXT,
    voice_lang VARCHAR(10),
    photo_url TEXT,
    vision_ai_findings JSONB,
    reported_offline BOOLEAN DEFAULT FALSE,
    risk_delta INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- G. Alerts & Escalation Lifecycle
CREATE TABLE alerts (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    bottle_id VARCHAR(100) REFERENCES chemical_bottles(id) ON DELETE SET NULL,
    chemical_name VARCHAR(255),
    school_name VARCHAR(255),
    severity risk_level_enum NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status alert_status_enum NOT NULL DEFAULT 'raised',
    current_assigned_role user_role_enum DEFAULT 'teacher',
    raised_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledged_by VARCHAR(150),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by VARCHAR(150),
    escalation_level INT DEFAULT 1,
    sms_whatsapp_sent BOOLEAN DEFAULT FALSE
);

-- H. LangGraph HITL Authorization Queue (Principal Dual-Key Approval)
CREATE TABLE langgraph_authorizations (
    id VARCHAR(100) PRIMARY KEY,
    school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    bottle_id VARCHAR(100) REFERENCES chemical_bottles(id) ON DELETE SET NULL,
    chemical_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    risk_score INT NOT NULL,
    proposed_by_agent VARCHAR(100) DEFAULT 'ReagentWatch LangGraph Guard',
    reasoning_chain JSONB,
    status hitl_status_enum NOT NULL DEFAULT 'pending_principal_approval',
    principal_notes TEXT,
    approved_by_user_id VARCHAR(100) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP WITH TIME ZONE
);

-- I. Inter-School Reagent Exchange Transfers
CREATE TABLE reagent_transfers (
    id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    from_school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    to_school_id VARCHAR(100) NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    chemical_id VARCHAR(100) NOT NULL REFERENCES chemicals_master(id) ON DELETE CASCADE,
    bottle_id VARCHAR(100) REFERENCES chemical_bottles(id) ON DELETE SET NULL,
    quantity_ml DECIMAL(8, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_approval',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- J. Cluster Disposal Pools (District GIS Hazmat Route)
CREATE TABLE cluster_disposal_pools (
    id VARCHAR(100) PRIMARY KEY,
    district VARCHAR(100) NOT NULL,
    pool_name VARCHAR(150) NOT NULL,
    status VARCHAR(50) DEFAULT 'forming',
    scheduled_pickup_date DATE,
    lead_school_name VARCHAR(255),
    total_bottles_count INT DEFAULT 0,
    participating_schools TEXT[] DEFAULT ARRAY[]::TEXT[],
    route_total_distance_km DECIMAL(6, 2) DEFAULT 100.20,
    route_stop_count INT DEFAULT 5,
    estimated_cost_saved_pct INT DEFAULT 65,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- K. System Evaluation Benchmarking (Accuracy, Precision, Recall Metrics)
CREATE TABLE system_evaluations (
    id VARCHAR(100) PRIMARY KEY,
    evaluation_name VARCHAR(100) NOT NULL,
    benchmark_dataset_size INT NOT NULL,
    ground_truth_hazards INT NOT NULL,
    detected_hazards INT NOT NULL,
    true_positives INT NOT NULL,
    false_positives INT NOT NULL,
    false_negatives INT NOT NULL,
    precision_score DECIMAL(5, 4) NOT NULL,
    recall_score DECIMAL(5, 4) NOT NULL,
    f1_score DECIMAL(5, 4) NOT NULL,
    validation_input_catch_rate DECIMAL(5, 4) NOT NULL,
    mean_time_to_ack_minutes DECIMAL(6, 2) NOT NULL,
    mean_time_to_resolve_hours DECIMAL(6, 2) NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE CLIENT
-- ============================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemicals_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE chemical_bottles ENABLE ROW LEVEL SECURITY;
ALTER TABLE degradation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE langgraph_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reagent_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_disposal_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public full access to schools" ON schools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to storage_locations" ON storage_locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to chemicals_master" ON chemicals_master FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to chemical_bottles" ON chemical_bottles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to degradation_events" ON degradation_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to alerts" ON alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to langgraph_authorizations" ON langgraph_authorizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to reagent_transfers" ON reagent_transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to cluster_disposal_pools" ON cluster_disposal_pools FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access to system_evaluations" ON system_evaluations FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- 4. HIGH-SPEED SEARCH INDEXES
-- ============================================================================
CREATE INDEX idx_bottles_school ON chemical_bottles(school_id);
CREATE INDEX idx_bottles_qr ON chemical_bottles(qr_code);
CREATE INDEX idx_bottles_risk ON chemical_bottles(risk_level, current_risk_score);
CREATE INDEX idx_alerts_school ON alerts(school_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- ============================================================================
-- 5. INITIAL SEED DATA (TAMIL NADU SCHOOLS, USERS & INVENTORY)
-- ============================================================================

-- A. Schools Seed
INSERT INTO schools (id, code, name, district, state, latitude, longitude, contact_phone, contact_email, power_cut_frequency_weekly, avg_lab_humidity_pct, risk_grade, last_audit_date)
VALUES
('school-1', 'GHSS-POL-01', 'Govt Higher Secondary School, Pollachi West', 'Coimbatore Peri-Urban', 'Tamil Nadu', 10.6609, 77.0048, '+91 94421 88301', 'ghss.pollachi@edu.tn.gov.in', 4, 78, 'C', '2026-08-12'),
('school-2', 'SMSS-SUL-02', 'Sulur Rural Model Secondary School', 'Coimbatore Peri-Urban', 'Tamil Nadu', 11.0286, 77.1265, '+91 94432 10982', 'sulur.model@edu.tn.gov.in', 2, 68, 'B', '2026-09-01'),
('school-3', 'MRHS-MAD-03', 'Madukkarai Community High School', 'Coimbatore Peri-Urban', 'Tamil Nadu', 10.9042, 76.9634, '+91 98425 43210', 'madukkarai.high@edu.tn.gov.in', 5, 82, 'D', '2026-07-20'),
('school-4', 'TCS-THO-04', 'Thondamuthur Foothills Secondary School', 'Coimbatore Peri-Urban', 'Tamil Nadu', 10.9981, 76.8322, '+91 98430 77119', 'thondamuthur.sec@edu.tn.gov.in', 3, 72, 'B', '2026-09-18'),
('school-5', 'AVSS-ANN-05', 'Annur Valley High School', 'Coimbatore Peri-Urban', 'Tamil Nadu', 11.2338, 77.1352, '+91 97890 66543', 'annur.valley@edu.tn.gov.in', 3, 65, 'A', '2026-08-28');

-- B. Pre-configured Users with OTP (Teacher, Principal, District Officer)
INSERT INTO users (id, username, name, email, password_hash, phone, role, designation, school_id, preferred_language, otp_code, email_verified)
VALUES
('user-teacher-01', 'selvakumar_chem', 'R. Selvakumar, M.Sc.', 'teacher@tn.gov.in', 'teacher123', '+91 94421 88301', 'teacher', 'Senior PGT Chemistry & Lab Custodian', 'school-1', 'ta', '123456', TRUE),
('user-principal-02', 'meenakshi_phd', 'Dr. K. Meenakshi, Ph.D.', 'principal@tn.gov.in', 'principal123', '+91 98425 43210', 'principal', 'Headmistress & Institutional Safety Authority', 'school-3', 'en', '123456', TRUE),
('user-deo-03', 'murugesan_deo', 'Er. S. Murugesan, M.Tech', 'deo@tnschools.gov.in', 'deo123', '+91 98430 77119', 'district_officer', 'District Education Officer & Hazmat Incident Commander', NULL, 'en', '123456', TRUE);

-- C. Storage Locations (Laboratory Shelves & Cabinets)
INSERT INTO storage_locations (id, school_id, room_name, cabinet_name, shelf_number, is_ventilated, is_cold_storage, temp_celsius, humidity_pct)
VALUES
('loc-shelf-a', 'school-1', 'Chemistry Lab Room 102', 'Cabinet A - Corrosives', 'Shelf 1 (Acids)', TRUE, FALSE, 26.5, 68),
('loc-shelf-b', 'school-1', 'Chemistry Lab Room 102', 'Cabinet B - Caustics & Bases', 'Shelf 2 (Bases)', FALSE, FALSE, 27.0, 70),
('loc-shelf-c', 'school-1', 'Chemistry Lab Room 102', 'Cabinet C - Flammables & Solvents', 'Shelf 3 (Organics)', TRUE, FALSE, 25.0, 62),
('loc-shelf-d', 'school-1', 'Chemistry Lab Room 102', 'Cabinet D - Reactive & Oxidizers', 'Shelf 4 (Peroxide Formers)', TRUE, TRUE, 22.0, 55);

-- D. Chemical Master Catalog
INSERT INTO chemicals_master (id, cas_number, canonical_name, chemical_formula, pubchem_cid, ghs_classes, peroxide_former_class, is_hygroscopic, is_light_sensitive, max_shelf_life_days, post_open_shelf_life_days, storage_compatibility_group, safe_handling_summary)
VALUES
('chem-ether', '60-29-7', 'Diethyl Ether (Stabilized with BHT)', '(C2H5)2O', 3283, ARRAY['GHS02_FLAMMABLE', 'GHS07_HARMFUL'], 'class_b_concentration_hazard', FALSE, TRUE, 730, 180, 'organic_flammable', 'Explosive peroxide former. Do not evaporate to dryness. If crystals are present, treat as high shock-sensitive explosive.'),
('chem-thf', '109-99-9', 'Tetrahydrofuran (THF)', 'C4H8O', 8028, ARRAY['GHS02_FLAMMABLE', 'GHS07_HARMFUL', 'GHS08_HEALTH_HAZARD'], 'class_b_concentration_hazard', TRUE, TRUE, 730, 180, 'organic_flammable', 'Peroxide former. Store in tightly sealed container away from heat.'),
('chem-naoh', '1310-73-2', 'Sodium Hydroxide Pellets', 'NaOH', 14798, ARRAY['GHS05_CORROSIVE'], 'none', TRUE, FALSE, 1095, 365, 'base', 'Deliquescent strong base. Absorbs moisture and CO2 from atmosphere. Keep cap tightly closed.'),
('chem-hno3', '7697-37-2', 'Nitric Acid 68-70%', 'HNO3', 944, ARRAY['GHS03_OXIDIZER', 'GHS05_CORROSIVE', 'GHS06_TOXIC'], 'none', FALSE, TRUE, 730, 365, 'inorganic_acid', 'Extremely strong oxidizer and corrosive mineral acid. Incompatible with organic acids, flammables, and reducing agents.'),
('chem-hcl', '7647-01-0', 'Hydrochloric Acid 35-37%', 'HCl', 313, ARRAY['GHS05_CORROSIVE', 'GHS07_HARMFUL'], 'none', FALSE, FALSE, 1095, 540, 'inorganic_acid', 'Fuming acid. Corrosive vapors corrode metal shelving and nearby containers.'),
('chem-acetone', '67-64-1', 'Acetone Technical Grade', 'CH3COCH3', 180, ARRAY['GHS02_FLAMMABLE', 'GHS07_HARMFUL'], 'none', FALSE, FALSE, 1095, 730, 'organic_flammable', 'Highly flammable solvent. Keep away from ignition sources and oxidizers.'),
('chem-picric', '88-89-1', 'Picric Acid (Hydrated)', 'C6H3N3O7', 6954, ARRAY['GHS01_EXPLOSIVE', 'GHS06_TOXIC'], 'none', FALSE, TRUE, 730, 180, 'reactive_explosive', 'Shock-sensitive explosive if dry. Water content must be kept above 30% at all times.');

-- E. Initial Physical Bottles Inventory
INSERT INTO chemical_bottles (id, qr_code, school_id, location_id, chemical_id, batch_number, manufacturer, initial_volume_ml, current_volume_ml, unit, received_date, opened_date, expiry_date, status, current_risk_score, risk_level, risk_factors)
VALUES
('bottle-1-ether-critical', 'QR-GHSS-ETH-001', 'school-1', 'loc-shelf-c', 'chem-ether', 'BT-2024-ETH-09', 'Merck India Lab Reagents', 500, 120, 'ml', '2024-01-10', '2024-03-01', '2025-06-30', 'opened', 98, 'critical', '["🚨 IMMEDIATE DETONATION RISK: Peroxide crystals detected. DO NOT TWIST CAP OR MOVE.", "Class B Peroxide Former opened > 180 days (910+ days since open)", "4 weekly grid power outages recorded at Pollachi lab"]'::JSONB),
('bottle-2-naoh-cake', 'QR-SMSS-NAOH-002', 'school-2', 'loc-shelf-b', 'chem-naoh', 'BT-2025-NAOH-44', 'Nice Chemicals Cochin', 1000, 750, 'g', '2025-02-15', '2025-03-10', '2028-02-15', 'opened', 42, 'medium', '["Hygroscopic deliquescent base exposed to 68% lab humidity", "Partial crust/caking detected on rim"]'::JSONB),
('bottle-3-hno3-fume', 'QR-MRHS-HNO3-003', 'school-3', 'loc-shelf-a', 'chem-hno3', 'BT-2024-NIT-12', 'Rankem Laboratory Chemicals', 2500, 2100, 'ml', '2024-06-01', '2024-07-05', '2026-06-01', 'opened', 88, 'critical', '["🚨 VIOLATION: Nitric Acid stored on same shelf as Glacial Acetic Acid", "Vapor corrosion on cabinet hinges", "82% ambient humidity accelerates fuming"]'::JSONB),
('bottle-4-hcl-safe', 'QR-TCS-HCL-004', 'school-4', 'loc-shelf-a', 'chem-hcl', 'BT-2025-HCL-88', 'Loba Chemie Mumbai', 1000, 850, 'ml', '2025-01-20', '2025-02-01', '2028-01-20', 'opened', 15, 'safe', '["Properly segregated in acid-resistant cabinet", "Ventilation fan operational"]'::JSONB),
('bottle-5-picric-warn', 'QR-AVSS-PIC-005', 'school-5', 'loc-shelf-d', 'chem-picric', 'BT-2023-PIC-01', 'BDH Chemicals', 250, 80, 'g', '2023-11-10', '2023-12-01', '2026-11-10', 'opened', 92, 'critical', '["Water desiccation alert: moisture layer depleted below 30%", "Dry picrate crystals can detonate on friction"]'::JSONB);

-- F. Initial Safety Alerts
INSERT INTO alerts (id, school_id, bottle_id, chemical_name, school_name, severity, title, message, status, current_assigned_role, raised_at, escalation_level, sms_whatsapp_sent)
VALUES
('alert-01', 'school-1', 'bottle-1-ether-critical', 'Diethyl Ether (CAS: 60-29-7)', 'Govt Higher Secondary School, Pollachi West', 'critical', '🚨 CRITICAL DETONATION HAZARD: Peroxide Crystals Detected', 'Teacher observed needle-like white peroxide crystals around bottle cap neck. DO NOT MOVE BOTTLE. Automated Level-2 Dual-Key Quarantine Escalation triggered to Principal and DEO Hazmat.', 'raised', 'teacher', CURRENT_TIMESTAMP - INTERVAL '15 minutes', 2, TRUE),
('alert-02', 'school-3', 'bottle-3-hno3-fume', 'Nitric Acid 68% (CAS: 7697-37-2)', 'Madukkarai Community High School', 'critical', '🔥 INCOMPATIBLE STORAGE: Nitric Acid + Acetic Acid Co-located', 'Nitric Acid stored immediately adjacent to Glacial Acetic Acid in unventilated wooden cabinet. High risk of catastrophic exothermic reaction and toxic NOx plume.', 'raised', 'principal', CURRENT_TIMESTAMP - INTERVAL '1 hour', 2, TRUE);

-- G. LangGraph HITL Authorization Queue (Principal Dual-Key Approval)
INSERT INTO langgraph_authorizations (id, school_id, bottle_id, chemical_name, action_type, risk_score, reasoning_chain, status)
VALUES
('auth-hitl-001', 'school-1', 'bottle-1-ether-critical', 'Diethyl Ether (Stabilized with BHT)', 'quarantine_immediate', 98, '["LangGraph Safety Supervisor evaluated bottle BTL-1", "Confirmed Peroxide crystals visual anomaly (Confidence: 94%)", "Recommended In-Situ Mineral Oil wetting and Class-1 Hazmat disposal pool"]'::JSONB, 'pending_principal_approval');

-- H. Cluster Disposal Pool
INSERT INTO cluster_disposal_pools (id, district, pool_name, status, scheduled_pickup_date, lead_school_name, total_bottles_count, participating_schools, route_total_distance_km, route_stop_count, estimated_cost_saved_pct)
VALUES
('pool-cbe-2026-q4', 'Coimbatore Peri-Urban', 'Coimbatore South Peri-Urban Hazmat Collection Sweep', 'scheduled', '2026-10-25', 'Govt Higher Secondary School, Pollachi West', 18, ARRAY['school-1', 'school-2', 'school-3', 'school-4', 'school-5'], 100.20, 5, 65);

-- I. System Evaluation Benchmarking Ground Truth
INSERT INTO system_evaluations (id, evaluation_name, benchmark_dataset_size, ground_truth_hazards, detected_hazards, true_positives, false_positives, false_negatives, precision_score, recall_score, f1_score, validation_input_catch_rate, mean_time_to_ack_minutes, mean_time_to_resolve_hours)
VALUES
('eval-cbe-baseline-2026', 'Tamil Nadu Secondary Schools Lab Benchmark (300 Reagents)', 300, 68, 67, 66, 1, 2, 0.9851, 0.9706, 0.9778, 1.0000, 3.40, 1.80);

-- ============================================================================
-- SUCCESS: Schema and Seed Data Successfully Populated!
-- ============================================================================
