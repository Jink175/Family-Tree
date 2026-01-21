import type { FamilyTree } from "./types"

const STORAGE_KEY = "familyTrees"
const CURRENT_TREE_KEY = "currentFamilyTree"

export function saveTree(tree: FamilyTree): void {
  try {
    const trees = getAllTrees()
    const existingIndex = trees.findIndex((t) => t.id === tree.id)

    if (existingIndex >= 0) {
      trees[existingIndex] = {
        ...tree,
        updated_at: new Date(),
      }
    } else {
      trees.push({
        ...tree,
        created_at: new Date(),
        updated_at: new Date(),
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trees))
    localStorage.setItem(CURRENT_TREE_KEY, JSON.stringify(tree))
  } catch (error) {
    console.error("Failed to save tree:", error)
  }
}

export function loadTree(id: string): FamilyTree | null {
  try {
    const trees = getAllTrees()
    return trees.find((t) => t.id === id) || null
  } catch (error) {
    console.error("Failed to load tree:", error)
    return null
  }
}

export function getAllTrees(): FamilyTree[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error("Failed to get trees:", error)
    return []
  }
}

export function getCurrentTree(): FamilyTree | null {
  try {
    const data = localStorage.getItem(CURRENT_TREE_KEY)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error("Failed to get current tree:", error)
    return null
  }
}

export function deleteTree(id: string): void {
  try {
    const trees = getAllTrees()
    const filtered = trees.filter((t) => t.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Failed to delete tree:", error)
  }
}

export function exportTreeAsJSON(tree: FamilyTree): string {
  return JSON.stringify(tree, null, 2)
}

export function importTreeFromJSON(jsonString: string): FamilyTree {
  return JSON.parse(jsonString)
}
