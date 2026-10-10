-- =====================================================================
-- Archai Showcase — promote an EXISTING Supabase Auth user to admin.
-- Run AFTER creating admin@gmail.com in Supabase Dashboard:
-- Authentication -> Users -> Add user -> confirm email.
-- This script never inserts/updates auth.users or auth.identities.
-- Therefore it avoids generated-column errors (e.g. confirmed_at) and
-- does not depend on Supabase's internal Auth schema implementation.
-- =====================================================================
DO $$
DECLARE
  v_user_id uuid;
  v_email constant text := 'admin@gmail.com';
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Auth user % was not found. First create the user in Supabase Dashboard -> Authentication -> Users, confirm the email, then rerun this script.', v_email
      USING HINT = 'Do not create auth.users directly with SQL. Use the Supabase Auth Dashboard or Auth Admin API.';
  END IF;

  INSERT INTO public.profiles (id, role, name)
  VALUES (v_user_id, 'admin', 'Archai Admin')
  ON CONFLICT (id) DO UPDATE
    SET role = 'admin', name = 'Archai Admin';
END $$;

-- Verification: role should be admin and email_confirmed should be true.
SELECT u.email,
       (u.email_confirmed_at IS NOT NULL) AS email_confirmed,
       p.role,
       p.name
FROM auth.users AS u
LEFT JOIN public.profiles AS p ON p.id = u.id
WHERE lower(u.email) = lower('admin@gmail.com');
