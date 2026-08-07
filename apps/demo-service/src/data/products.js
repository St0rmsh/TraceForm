export const products = [
  { id: 1, name: "Wireless Mouse", price: 24.99, category: "electronics", stock: 142 },
  { id: 2, name: "Mechanical Keyboard", price: 89.99, category: "electronics", stock: 58 },
  { id: 3, name: "USB-C Hub", price: 34.5, category: "electronics", stock: 210 },
  { id: 4, name: "Standing Desk", price: 349.0, category: "furniture", stock: 12 },
  { id: 5, name: "Office Chair", price: 199.99, category: "furniture", stock: 27 },
  { id: 6, name: "Desk Lamp", price: 42.0, category: "furniture", stock: 88 },
  { id: 7, name: "Notebook Set", price: 14.99, category: "stationery", stock: 305 },
  { id: 8, name: "Fountain Pen", price: 22.5, category: "stationery", stock: 76 },
];

export function findProductById(id) {
  return products.find((p) => p.id === Number(id));
}

export function findProductsByCategory(category) {
  return products.filter((p) => p.category === category);
}