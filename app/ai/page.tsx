'use client'

import { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, CameraOff, Loader2 } from 'lucide-react'

interface RecognitionResult {
  name: string
  confidence: number
  timestamp: string
}

export default function FaceRecognitionPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<RecognitionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Start camera
  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsCameraActive(true)
      }
    } catch (err) {
      setError('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.')
      console.error('Camera error:', err)
    }
  }

  // Stop camera
  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setIsCameraActive(false)
  }

  // Capture and send for recognition
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return

    try {
      setIsLoading(true)
      setError(null)
      setResult(null)

      // Capture frame from video
      const ctx = canvasRef.current.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      canvasRef.current.width = videoRef.current.videoWidth
      canvasRef.current.height = videoRef.current.videoHeight
      ctx.drawImage(videoRef.current, 0, 0)

      // Convert to blob
      const blob = await new Promise<Blob>(resolve => {
        canvasRef.current!.toBlob(blob => resolve(blob!), 'image/jpeg', 0.9)
      })

      // Send to API endpoint for face recognition
      const formData = new FormData()
      formData.append('image', blob, 'capture.jpg')

      const response = await fetch('/api/recognize-face', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Nhận diện thất bại')
      }

      const data = await response.json()
      setResult({
        name: data.name,
        confidence: data.confidence,
        timestamp: new Date().toLocaleTimeString('vi-VN')
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi'
      setError(errorMessage)
      console.error('Recognition error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (isCameraActive) {
        stopCamera()
      }
    }
  }, [isCameraActive])

  return (
    <div className="w-full h-full flex flex-col overflow-auto bg-background mt-30 rounded-2xl">
      {/* Header */}
      <div className="border-b border-border bg-card p-6">
        <h1 className="text-3xl font-bold">Nhận Diện Khuôn Mặt</h1>
        <p className="text-muted-foreground mt-2">Kích hoạt camera và chụp ảnh để nhận diện danh tính</p>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {/* Camera Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Camera</CardTitle>
                <CardDescription>Phát trực tiếp từ thiết bị của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden" />

                {/* Controls */}
                <div className="flex gap-3 flex-wrap">
                  {!isCameraActive ? (
                    <Button
                      onClick={startCamera}
                      size="lg"
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Bật Camera
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={captureAndRecognize}
                        disabled={isLoading}
                        size="lg"
                        className="gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Chụp & Nhận Diện
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={stopCamera}
                        variant="outline"
                        size="lg"
                        className="gap-2 bg-transparent"
                      >
                        <CameraOff className="w-4 h-4" />
                        Tắt Camera
                      </Button>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Kết Quả</CardTitle>
                <CardDescription>Thông tin nhận diện</CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Chụp ảnh để xem kết quả</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
                      <p className="text-sm text-muted-foreground mb-1">Tên</p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {result.name}
                      </p>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Độ Tin Cậy</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">
                          {(result.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Thời Gian</p>
                      <p className="text-sm font-mono">{result.timestamp}</p>
                    </div>

                    <Button
                      onClick={() => {
                        setResult(null)
                        startCamera()
                      }}
                      variant="outline"
                      className="w-full"
                    >
                      Chụp Lại
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Hướng Dẫn</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>1. Bấm "Bật Camera" để kích hoạt camera</p>
                <p>2. Định vị khuôn mặt vào góc nhìn</p>
                <p>3. Bấm "Chụp & Nhận Diện" để bắt đầu</p>
                <p>4. Chờ kết quả xuất hiện</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
