CREATE OR REPLACE FUNCTION public.public_summary(_owner uuid, _month date)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object(
    'saldo',
      COALESCE((SELECT sum(amount) FROM payments WHERE user_id=_owner AND status='paid'),0)
    + COALESCE((SELECT sum(amount) FROM casual_players WHERE user_id=_owner AND paid),0)
    + COALESCE((SELECT sum(amount) FROM additional_income WHERE user_id=_owner),0)
    - COALESCE((SELECT sum(amount) FROM court_expenses WHERE user_id=_owner),0)
    - COALESCE((SELECT sum(amount) FROM extra_expenses WHERE user_id=_owner),0),
    'alunos', COALESCE((SELECT json_agg(json_build_object('name', s.name,
        'pago', EXISTS(SELECT 1 FROM payments p WHERE p.student_id=s.id AND p.status='paid'
          AND date_trunc('month',p.due_date)=date_trunc('month',_month))) ORDER BY s.name)
      FROM students s WHERE s.user_id=_owner AND s.active), '[]'::json)
  );
$$;
GRANT EXECUTE ON FUNCTION public.public_summary(uuid, date) TO anon, authenticated;