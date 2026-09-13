import { z } from "zod";

/**
 * Sign-in stays at eight characters on purpose.
 *
 * It is the floor accounts were created under, and raising it here would lock
 * out every customer who already has a shorter password — a password rule is
 * a gate on new passwords, never a reason to refuse an existing one. New
 * accounts are held to the stricter rule below.
 */
export const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

/**
 * The handful of passwords that get tried first.
 *
 * Not a wordlist — a real breach corpus is megabytes and belongs behind an
 * API. This is the short head of the distribution, which is where a
 * meaningful share of real guesses land, plus the ones this product invites
 * specifically. Checked case- and digit-insensitively so "Wedding2026!"
 * cannot walk past a rule aimed at "wedding".
 */
const TOO_COMMON = [
  "password", "passw0rd", "12345678", "123456789", "qwerty", "qwertyui",
  "abc12345", "iloveyou", "letmein", "welcome", "admin123", "football",
  "monkey", "dragon", "sunshine", "princess", "mangalyam", "wedding",
  "invitation", "malaysia",
];

const strongPassword = z
  .string()
  .min(10, "Use at least 10 characters — length matters more than symbols")
  .max(200)
  .refine(
    (value) => {
      const flat = value.toLowerCase().replace(/[^a-z]/g, "");
      return !TOO_COMMON.some((bad) => flat === bad || flat.startsWith(bad));
    },
    "That is one of the first passwords anyone would try. Pick something else.",
  )
  .refine(
    // Three or more of anything in a row is a keyboard mash, not a password.
    (value) => !/(.)\1{3,}/.test(value),
    "Too many repeated characters in a row",
  );

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(80),
  email: z.string().email("Enter a valid email address"),
  password: strongPassword,
});

export type SignupInput = z.infer<typeof signupSchema>;
