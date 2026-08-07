export const users = [
  { id: 1, name: "Ava Thompson", email: "ava.thompson@example.com", plan: "pro" },
  { id: 2, name: "Liam Chen", email: "liam.chen@example.com", plan: "free" },
  { id: 3, name: "Sofia Martinez", email: "sofia.martinez@example.com", plan: "pro" },
  { id: 4, name: "Noah Patel", email: "noah.patel@example.com", plan: "free" },
  { id: 5, name: "Emma Wilson", email: "emma.wilson@example.com", plan: "enterprise" },
];

export function findUserById(id) {
  return users.find((u) => u.id === Number(id));
}