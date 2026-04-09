-- Create Audit Trigger Function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB := NULL;
    new_data JSONB := NULL;
    changed_by_val TEXT := NULL;
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        old_data := to_jsonb(OLD);
    ELSIF (TG_OP = 'INSERT') THEN
        new_data := to_jsonb(NEW);
    END IF;

    -- Try to get current user from session if available (optional)
    -- For now, we'll leave it as NULL or handle it in the app layer if needed
    -- But the TRD says "Aplikasi tidak memiliki akses write langsung ke tabel ini"
    -- so we rely on the trigger.

    INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, created_at)
    VALUES (TG_TABLE_NAME, COALESCE(NEW.id, OLD.id)::TEXT, TG_OP, old_data, new_data, NOW());

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply Trigger to Tables
CREATE TRIGGER audit_organizations_trigger
AFTER INSERT OR UPDATE OR DELETE ON organizations
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_users_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_dynamic_forms_trigger
AFTER INSERT OR UPDATE OR DELETE ON dynamic_forms
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_registrations_trigger
AFTER INSERT OR UPDATE OR DELETE ON registrations
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
