// BE-067. Private operational state; immutable merchant histories stay in their
// existing tables. No enrollment is inferred or created by the migration.
export const DEMO_SIMULATOR_TABLES = ['demo_simulator_control','demo_simulator_enrollments','demo_simulator_runs'] as const;
export const DEMO_SIMULATOR_SCHEMA_SQL = `
CREATE TABLE demo_simulator_control (
 id INTEGER PRIMARY KEY CHECK(id=1), enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),
 last_slot BIGINT NOT NULL DEFAULT -1, budget_day BIGINT NOT NULL DEFAULT -1,
 used_today INTEGER NOT NULL DEFAULT 0 CHECK(used_today>=0),
 daily_limit INTEGER NOT NULL DEFAULT 2880 CHECK(daily_limit BETWEEN 1 AND 5000),
 database_limit_bytes BIGINT NOT NULL DEFAULT 268435456 CHECK(database_limit_bytes BETWEEN 33554432 AND 536870912),
 pause_reason TEXT NOT NULL DEFAULT '' CHECK(pause_reason IN ('','operator','daily_budget','database_budget'))
);
INSERT INTO demo_simulator_control(id) VALUES(1);
CREATE TABLE demo_simulator_enrollments (
 business_id INTEGER PRIMARY KEY REFERENCES businesses(id) ON DELETE CASCADE,
 handle TEXT NOT NULL, owner_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 provider_user_id TEXT NOT NULL CHECK(length(provider_user_id) BETWEEN 32 AND 64),
 product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
 scenario_key TEXT NOT NULL CHECK(scenario_key IN ('seasonal-harvest','workshop-production','wholesale-replenishment')),
 scenario_version INTEGER NOT NULL CHECK(scenario_version=1),
 parameters_json TEXT NOT NULL CHECK(length(parameters_json)<=4000),
 baseline_page_json TEXT NOT NULL CHECK(length(baseline_page_json)<=16000),
 expected_hash TEXT NOT NULL CHECK(length(expected_hash)=64),
 stage INTEGER NOT NULL DEFAULT -1 CHECK(stage BETWEEN -1 AND 5),
 cycle INTEGER NOT NULL DEFAULT 0 CHECK(cycle BETWEEN 0 AND 1000000000),
 stage_started_at BIGINT NOT NULL DEFAULT 0, due_at BIGINT NOT NULL,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused')),
 reason TEXT NOT NULL DEFAULT '' CHECK(reason IN ('','operator','eligibility_changed','content_changed','stage_failed')),
 enrolled_at BIGINT NOT NULL
);
CREATE INDEX demo_simulator_due_idx ON demo_simulator_enrollments(due_at,business_id) WHERE status='active';
CREATE TABLE demo_simulator_runs (
 slot BIGINT NOT NULL, business_id INTEGER REFERENCES businesses(id) ON DELETE SET NULL,
 scenario_key TEXT NOT NULL, stage INTEGER NOT NULL, cycle INTEGER NOT NULL,
 outcome TEXT NOT NULL CHECK(outcome IN ('advanced','paused','failed')),
 created_at BIGINT NOT NULL
);
CREATE INDEX demo_simulator_runs_created_idx ON demo_simulator_runs(created_at);
ALTER TABLE demo_simulator_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_simulator_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_simulator_runs ENABLE ROW LEVEL SECURITY;
`;
