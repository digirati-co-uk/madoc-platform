import bcrypt from 'bcryptjs';

export async function passwordHash(password: string, rounds = 12): Promise<string> {
  if (rounds < 10 || rounds > 16) {
    throw new Error('Invalid salt');
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}
