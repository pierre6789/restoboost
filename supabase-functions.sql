-- Function to create default restaurant for a user
-- This function uses SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.create_default_restaurant(p_user_id UUID)
RETURNS SETOF public.restaurants
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slug TEXT;
  v_base_slug TEXT := 'mon-restaurant';
  v_counter INTEGER := 1;
BEGIN
  -- Generate a unique slug
  v_slug := v_base_slug;
  
  WHILE EXISTS (SELECT 1 FROM public.restaurants WHERE slug = v_slug) LOOP
    v_slug := v_base_slug || '-' || v_counter;
    v_counter := v_counter + 1;
  END LOOP;

  -- Insert and return the restaurant
  RETURN QUERY
  INSERT INTO public.restaurants (user_id, name, slug)
  VALUES (p_user_id, 'Mon Restaurant', v_slug)
  RETURNING *;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_default_restaurant(UUID) TO authenticated;

