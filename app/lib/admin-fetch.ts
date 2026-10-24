export async function buildAuthHeaders(
  idToken: string | null,
  refreshToken: () => Promise<string | null>,
): Promise<HeadersInit> {
  const token = idToken ?? (await refreshToken());
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}
