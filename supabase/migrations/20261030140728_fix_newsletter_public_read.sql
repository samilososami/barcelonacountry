-- Public visitors only need published issues, never the admin membership table.
alter policy newsletter_issues_public_read
  on public.newsletter_issues to authenticated;

create policy newsletter_issues_published_anon_read
  on public.newsletter_issues for select to anon
  using (is_published);
