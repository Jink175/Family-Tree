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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="photo">Photo</TabsTrigger>
          <TabsTrigger value="relations">Relations</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div>
            <h2 className="font-semibold mb-4">Person Details</h2>
          </div>

          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={selectedNode.name}
                onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                placeholder="Enter name"
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={selectedNode.gender || ""}
                onValueChange={(value) => updateNode(selectedNode.id, { gender: value as any })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="relationship">Relationship Type</Label>
              <Select
                value={selectedNode.relationship}
                onValueChange={(value) => updateNode(selectedNode.id, { relationship: value as any })}
              >
                <SelectTrigger id="relationship">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="child">Child</SelectItem>
                  <SelectItem value="spouse">Spouse</SelectItem>
                  <SelectItem value="sibling">Sibling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="birth">Birth Year</Label>
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
                <Label htmlFor="death">Death Year</Label>
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
              <Label htmlFor="notes">Notes & Biography</Label>
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

        <TabsContent value="relations" className="space-y-4">
          <div>
            <h2 className="font-semibold mb-4">Family Connections</h2>
          </div>

          {incomingConnections.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Connected From:</h3>
              <div className="space-y-2">
                {incomingConnections.map((conn) => {
                  const sourceNode = tree.nodes.find((n) => n.id === conn.sourceId)
                  return (
                    <div key={conn.id} className="text-sm flex justify-between items-center">
                      <span>
                        <span className="font-medium">{sourceNode?.name}</span>
                        <span className="text-muted-foreground ml-2">({conn.type})</span>
                      </span>
                      <Button variant="ghost" onClick={() => deleteArrow(conn.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {outgoingConnections.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-2">Connected To:</h3>
              <div className="space-y-2">
                {outgoingConnections.map((conn) => {
                  const targetNode = tree.nodes.find((n) => n.id === conn.targetId)
                  return (
                    <div key={conn.id} className="text-sm flex justify-between items-center">
                      <span>
                        <span className="font-medium">{targetNode?.name}</span>
                        <span className="text-muted-foreground ml-2">({conn.type})</span>
                      </span>
                      <Button variant="ghost" onClick={() => deleteArrow(conn.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {incomingConnections.length === 0 && outgoingConnections.length === 0 && (
            <p className="text-sm text-muted-foreground">No family connections yet</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
