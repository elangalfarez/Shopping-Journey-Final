// lib/image-utils.ts
// Created: Image compression and optimization utilities

/**
 * Compress an image file while maintaining quality
 * @param file Original file
 * @param maxWidth Maximum width (maintains aspect ratio)
 * @param quality JPEG quality (0-1)
 * @returns Compressed blob
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.85
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width
                let height = img.height

                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                // Create canvas
                const canvas = document.createElement("canvas")
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext("2d")
                if (!ctx) {
                    resolve(file)
                    return
                }

                // Draw image
                ctx.drawImage(img, 0, 0, width, height)

                // Convert to blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            resolve(file)
                        }
                    },
                    "image/jpeg",
                    quality
                )
            }

            img.onerror = () => {
                reject(new Error("Failed to load image"))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error("Failed to read file"))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Get image dimensions from a file
 */
export async function getImageDimensions(
    file: File
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                resolve({ width: img.width, height: img.height })
            }

            img.onerror = () => {
                reject(new Error("Failed to load image"))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error("Failed to read file"))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Convert a file to base64 data URL
 */
export function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            resolve(e.target?.result as string)
        }

        reader.onerror = () => {
            reject(new Error("Failed to read file"))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Check if file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith("image/")
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

/**
 * Convert blob to file
 */
export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, {
        type: blob.type,
        lastModified: Date.now(),
    })
}

/**
 * Rotate image by degrees
 */
export async function rotateImage(
    file: File,
    degrees: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                const canvas = document.createElement("canvas")
                const ctx = canvas.getContext("2d")

                if (!ctx) {
                    resolve(file)
                    return
                }

                // Swap dimensions for 90/270 degree rotation
                const isVerticalRotation = degrees === 90 || degrees === 270
                canvas.width = isVerticalRotation ? img.height : img.width
                canvas.height = isVerticalRotation ? img.width : img.height

                // Rotate
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.rotate((degrees * Math.PI) / 180)
                ctx.drawImage(img, -img.width / 2, -img.height / 2)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob)
                        } else {
                            resolve(file)
                        }
                    },
                    file.type,
                    0.95
                )
            }

            img.onerror = () => {
                reject(new Error("Failed to load image"))
            }

            img.src = e.target?.result as string
        }

        reader.onerror = () => {
            reject(new Error("Failed to read file"))
        }

        reader.readAsDataURL(file)
    })
}

export default {
    compressImage,
    getImageDimensions,
    fileToDataURL,
    isImageFile,
    formatFileSize,
    blobToFile,
    rotateImage,
}