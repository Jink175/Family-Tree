"use client"
import { useTree } from "@/lib/tree-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "./image-upload"
import { Trash2 } from "lucide-react"

export function PropertiesPanel() {
  const { getSelectedNode, updateNode, tree, arrows, deleteArrow } = useTree()
  const selectedNode = getSelectedNode()

  if (!selectedNode) {
    return <div className="p-4 text-center text-muted-foreground">Select a person to edit their details</div>
  }

  const incomingConnections = tree.connections.filter((c) => c.targetId === selectedNode.id)
  const outgoingConnections = tree.connections.filter((c) => c.sourceId === selectedNode.id)

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger className="cursor-pointer" value="details">Details</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="photo">Photo</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div>
            <h2 className="font-semibold mb-4">Person Details</h2>
          </div>

          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="name" className="mb-2">Name</Label>
              <Input
                id="name"
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div>
              <Label htmlFor="gender" className="mb-2">Gender</Label>
              <Select
                value={selectedNode.gender || ""}
                onValueChange={(value) => updateNode(selectedNode.id, { gender: value as any })}
              >
                <SelectTrigger id="gender" className="cursor-pointer">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="male">Male</SelectItem>
                  <SelectItem className="cursor-pointer" value="female">Female</SelectItem>
                  <SelectItem className="cursor-pointer" value="other">Gay</SelectItem>
                  <SelectItem className="cursor-pointer" value="other">Les</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="birth" className="mb-2">Birth Year</Label>
                <Input
                  id="birth"
                  type="number"
                  value={selectedNode.birthYear || ""}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      birthYear: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Year"
                />
              </div>
              <div>
                <Label htmlFor="death" className="mb-2">Death Year</Label>
                <Input
                  id="death"
                  type="number"
                  value={selectedNode.deathYear || ""}
                  onChange={(e) =>
                    updateNode(selectedNode.id, {
                      deathYear: e.target.value ? Number.parseInt(e.target.value) : undefined,
                    })
                  }
                  placeholder="Year"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2">Notes & Biography</Label>
              <Textarea
                id="notes"
                value={selectedNode.notes}
                onChange={(e) => updateNode(selectedNode.id, { notes: e.target.value })}
                placeholder="Add any notes, biography, or important information about this person..."
                className="resize-none"
                rows={5}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="photo" className="space-y-4">
          <div>
            <h2 className="font-semibold mb-4">Person Photo</h2>
          </div>

          <Card className="p-4">
            <ImageUpload />
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
