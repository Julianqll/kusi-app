"use client"

import { useState, useEffect } from "react"
import { Mic, Phone, Calendar, Heart, Users, Wifi, WifiOff, Volume2, X, Clock, Pill, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis"

type Feature = "communication" | "health" | "pension" | "help" | null

type Contact = {
  id: string
  name: string
  phone: string
  relationship: string
}

type HealthReminder = {
  id: string
  medication: string
  time: string
  frequency: string
  taken: boolean
}

type HelpRequest = {
  id: string
  type: string
  status: "pending" | "connected" | "resolved"
  volunteer?: string
}

export default function KusiVozApp() {
  const [isListening, setIsListening] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [greeting, setGreeting] = useState(false)
  const [currentFeature, setCurrentFeature] = useState<Feature>(null)
  const [subtitle, setSubtitle] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingAction, setPendingAction] = useState("")
  
  // Hook para síntesis de voz
  const { speak, isSupported, isSpeaking, hasPermission, permissionError, pause, resume, stop } = useSpeechSynthesis()

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "1", name: "Carlos Quispe", phone: "987654321", relationship: "Hijo" },
    { id: "2", name: "María Huamán", phone: "987654322", relationship: "Hija" },
    { id: "3", name: "Dr. Pérez", phone: "987654323", relationship: "Doctor" },
    { id: "4", name: "Vecina Rosa", phone: "987654324", relationship: "Vecina" },
  ])

  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([
    { id: "1", medication: "Pastilla para presión", time: "08:00", frequency: "Diario", taken: false },
    { id: "2", medication: "Vitaminas", time: "12:00", frequency: "Diario", taken: false },
    { id: "3", medication: "Pastilla para diabetes", time: "20:00", frequency: "Diario", taken: false },
  ])

  const [pensionInfo, setPensionInfo] = useState({
    nextPayment: "15 de Enero 2025",
    amount: "S/ 500.00",
    lastPayment: "15 de Diciembre 2024",
    status: "Activo",
  })

  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [callInProgress, setCallInProgress] = useState(false)

  // Mostrar mensaje de bienvenida sin audio automático (requiere interacción del usuario)
  useEffect(() => {
    const timer = setTimeout(() => {
      setGreeting(true)
      const greetingText = "Allinllachu, bienvenido. Ima hina yanapawanqui?"
      setSubtitle(greetingText)

      setTimeout(() => {
        setGreeting(false)
        setSubtitle("")
      }, 5000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Simulate online/offline status
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.2)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const handleMicPress = () => {
    setIsListening(true)
    setSubtitle("Escuchando...")

    setTimeout(() => {
      setIsListening(false)
      simulateVoiceCommand()
    }, 2000)
  }

  // Función para repetir el saludo
  const repeatGreeting = () => {
    const greetingText = "Allinllachu, bienvenido. Ima hina yanapawanqui?"
    setSubtitle(greetingText)
    
    if (isSupported) {
      speak({ 
        text: greetingText, 
        language: 'es-ES',
        rate: 0.7,
        pitch: 1.0,
        volume: 1.0
      })
      
      // Si hay error de permisos, mostrar el texto por más tiempo
      setTimeout(() => {
        if (permissionError) {
          setSubtitle("")
        } else {
          setSubtitle("")
        }
      }, 6000)
    } else {
      // Si no está soportado, mostrar el texto por un tiempo más largo
      setTimeout(() => {
        setSubtitle("")
      }, 8000)
    }
  }

  const simulateVoiceCommand = () => {
    const commands = [
      { text: "Quiero llamar a mi hijo", action: "call", contact: "Carlos Quispe" },
      { text: "¿Cuándo cobro mi pensión?", action: "pension", info: "Tu pensión se deposita el 15 de cada mes" },
      { text: "Recordar medicina", action: "health", info: "Tomar pastilla para presión a las 8:00 AM" },
      { text: "Necesito ayuda", action: "help", info: "Conectando con Nieto Digital..." },
    ]

    const command = commands[Math.floor(Math.random() * commands.length)]

    if (command.action === "call") {
      setSubtitle(`¿Quieres llamar a ${command.contact}? Sí o No`)
      setShowConfirmation(true)
      setPendingAction(`Llamando a ${command.contact}...`)
    } else {
      setSubtitle(command.info)
      setTimeout(() => setSubtitle(""), 4000)
    }
  }

  const handleConfirm = (confirmed: boolean) => {
    setShowConfirmation(false)
    if (confirmed) {
      setSubtitle(pendingAction)
      setTimeout(() => setSubtitle(""), 3000)
    } else {
      setSubtitle("Cancelado")
      setTimeout(() => setSubtitle(""), 2000)
    }
  }

  const initiateCall = (contact: Contact) => {
    setSelectedContact(contact)
    setSubtitle(`¿Quieres llamar a ${contact.name}? Sí o No`)
    setShowConfirmation(true)
    setPendingAction("call")
  }

  const handleCallConfirm = (confirmed: boolean) => {
    setShowConfirmation(false)
    if (confirmed && selectedContact) {
      setCallInProgress(true)
      setSubtitle(`Llamando a ${selectedContact.name}...`)

      // Simulate call duration
      setTimeout(() => {
        setCallInProgress(false)
        setSubtitle("Llamada finalizada")
        setTimeout(() => {
          setSubtitle("")
          setCurrentFeature(null)
        }, 2000)
      }, 5000)
    } else {
      setSubtitle("Llamada cancelada")
      setTimeout(() => setSubtitle(""), 2000)
    }
  }

  const markMedicationTaken = (id: string) => {
    setHealthReminders((prev) => prev.map((reminder) => (reminder.id === id ? { ...reminder, taken: true } : reminder)))
    setSubtitle("Medicina marcada como tomada")
    setTimeout(() => setSubtitle(""), 2000)
  }

  const requestHelp = (type: string) => {
    const newRequest: HelpRequest = {
      id: Date.now().toString(),
      type,
      status: "pending",
    }
    setHelpRequests((prev) => [...prev, newRequest])
    setSubtitle("Buscando Nieto Digital disponible...")

    // Simulate connection
    setTimeout(() => {
      setHelpRequests((prev) =>
        prev.map((req) => (req.id === newRequest.id ? { ...req, status: "connected", volunteer: "Juan Pérez" } : req)),
      )
      setSubtitle("Conectado con Juan Pérez")
      setTimeout(() => setSubtitle(""), 3000)
    }, 3000)
  }

  const features = [
    { id: "communication" as Feature, icon: Phone, label: "Llamar", color: "bg-[#FF8A50]" },
    { id: "health" as Feature, icon: Heart, label: "Salud", color: "bg-[#4CAF50]" },
    { id: "pension" as Feature, icon: Calendar, label: "Pensión", color: "bg-[#2196F3]" },
    { id: "help" as Feature, icon: Users, label: "Ayuda", color: "bg-[#FF8A50]" },
  ]

  const renderFeatureModule = () => {
    switch (currentFeature) {
      case "communication":
        return (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#5D4037]">Mis Contactos</h2>
              <Button onClick={() => setCurrentFeature(null)} variant="ghost" size="lg" className="h-16 w-16">
                <X className="w-8 h-8" />
              </Button>
            </div>

            {callInProgress ? (
              <Card className="p-8 bg-[#4CAF50]/10 border-2 border-[#4CAF50]">
                <div className="text-center space-y-4">
                  <Phone className="w-24 h-24 mx-auto text-[#4CAF50] animate-pulse" />
                  <p className="text-3xl font-bold text-[#5D4037]">En llamada con {selectedContact?.name}</p>
                  <Button
                    onClick={() => {
                      setCallInProgress(false)
                      setSubtitle("Llamada finalizada")
                      setTimeout(() => {
                        setSubtitle("")
                        setCurrentFeature(null)
                      }, 2000)
                    }}
                    className="h-20 px-12 text-2xl font-bold bg-red-500 hover:bg-red-600 text-white"
                  >
                    Colgar
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid gap-4">
                {contacts.map((contact) => (
                  <Card
                    key={contact.id}
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => initiateCall(contact)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-[#5D4037]">{contact.name}</p>
                        <p className="text-xl text-[#5D4037]/70">{contact.relationship}</p>
                        <p className="text-lg text-[#5D4037]/50">{contact.phone}</p>
                      </div>
                      <Phone className="w-12 h-12 text-[#FF8A50]" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case "health":
        return (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#5D4037]">Recordatorios de Salud</h2>
              <Button onClick={() => setCurrentFeature(null)} variant="ghost" size="lg" className="h-16 w-16">
                <X className="w-8 h-8" />
              </Button>
            </div>

            <div className="grid gap-4">
              {healthReminders.map((reminder) => (
                <Card
                  key={reminder.id}
                  className={cn(
                    "p-6 transition-all",
                    reminder.taken ? "bg-[#4CAF50]/10 border-2 border-[#4CAF50]" : "bg-white",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="w-8 h-8 text-[#4CAF50]" />
                        <p className="text-2xl font-bold text-[#5D4037]">{reminder.medication}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xl text-[#5D4037]/70">
                        <Clock className="w-6 h-6" />
                        <span>
                          {reminder.time} - {reminder.frequency}
                        </span>
                      </div>
                    </div>
                    {!reminder.taken ? (
                      <Button
                        onClick={() => markMedicationTaken(reminder.id)}
                        className="h-16 px-8 text-xl font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white"
                      >
                        Tomada
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-[#4CAF50] text-xl font-bold">
                        <span>✓ Tomada</span>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-6 bg-[#2196F3]/10 border-2 border-[#2196F3]">
              <div className="flex items-start gap-4">
                <Info className="w-8 h-8 text-[#2196F3] flex-shrink-0" />
                <div>
                  <p className="text-xl font-bold text-[#5D4037] mb-2">Próxima cita médica</p>
                  <p className="text-lg text-[#5D4037]/70">Dr. Pérez - 20 de Enero, 10:00 AM</p>
                </div>
              </div>
            </Card>
          </div>
        )

      case "pension":
        return (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#5D4037]">Mi Pensión</h2>
              <Button onClick={() => setCurrentFeature(null)} variant="ghost" size="lg" className="h-16 w-16">
                <X className="w-8 h-8" />
              </Button>
            </div>

            <Card className="p-8 bg-gradient-to-br from-[#2196F3]/20 to-[#2196F3]/10 border-2 border-[#2196F3]">
              <div className="text-center space-y-4">
                <Calendar className="w-20 h-20 mx-auto text-[#2196F3]" />
                <div>
                  <p className="text-2xl text-[#5D4037]/70 mb-2">Próximo pago</p>
                  <p className="text-4xl font-bold text-[#5D4037]">{pensionInfo.nextPayment}</p>
                </div>
                <div className="pt-4 border-t-2 border-[#2196F3]/30">
                  <p className="text-2xl text-[#5D4037]/70 mb-2">Monto</p>
                  <p className="text-5xl font-bold text-[#4CAF50]">{pensionInfo.amount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-xl text-[#5D4037]/70">Último pago</p>
                  <p className="text-xl font-bold text-[#5D4037]">{pensionInfo.lastPayment}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xl text-[#5D4037]/70">Estado</p>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#4CAF50]" />
                    <p className="text-xl font-bold text-[#4CAF50]">{pensionInfo.status}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-[#FF8A50]/10 border-2 border-[#FF8A50]">
              <div className="flex items-start gap-4">
                <Info className="w-8 h-8 text-[#FF8A50] flex-shrink-0" />
                <div>
                  <p className="text-xl font-bold text-[#5D4037] mb-2">Información importante</p>
                  <p className="text-lg text-[#5D4037]/70 leading-relaxed">
                    Tu pensión se deposita automáticamente el día 15 de cada mes. Si tienes dudas, puedes llamar al
                    banco o pedir ayuda a un Nieto Digital.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )

      case "help":
        return (
          <div className="w-full max-w-2xl space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#5D4037]">Nietos Digitales</h2>
              <Button onClick={() => setCurrentFeature(null)} variant="ghost" size="lg" className="h-16 w-16">
                <X className="w-8 h-8" />
              </Button>
            </div>

            <Card className="p-8 bg-gradient-to-br from-[#FF8A50]/20 to-[#FF8A50]/10 border-2 border-[#FF8A50]">
              <div className="text-center space-y-4">
                <Users className="w-20 h-20 mx-auto text-[#FF8A50]" />
                <p className="text-2xl font-bold text-[#5D4037] leading-relaxed">
                  Los Nietos Digitales son jóvenes voluntarios que te ayudan con tecnología
                </p>
              </div>
            </Card>

            <div className="grid gap-4">
              <Button
                onClick={() => requestHelp("Usar aplicación")}
                className="h-24 text-2xl font-bold bg-[#FF8A50] hover:bg-[#ff7a40] text-white"
              >
                Ayuda con aplicación
              </Button>
              <Button
                onClick={() => requestHelp("Problema con teléfono")}
                className="h-24 text-2xl font-bold bg-[#2196F3] hover:bg-[#1976D2] text-white"
              >
                Problema con teléfono
              </Button>
              <Button
                onClick={() => requestHelp("Consulta general")}
                className="h-24 text-2xl font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                Consulta general
              </Button>
            </div>

            {helpRequests.length > 0 && (
              <div className="space-y-4 mt-6">
                <h3 className="text-2xl font-bold text-[#5D4037]">Mis solicitudes</h3>
                {helpRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-[#5D4037]">{request.type}</p>
                        {request.status === "connected" && request.volunteer && (
                          <p className="text-lg text-[#4CAF50]">Conectado con {request.volunteer}</p>
                        )}
                        {request.status === "pending" && (
                          <p className="text-lg text-[#FF8A50]">Buscando voluntario...</p>
                        )}
                      </div>
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full",
                          request.status === "connected" && "bg-[#4CAF50]",
                          request.status === "pending" && "bg-[#FF8A50] animate-pulse",
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D6] to-[#FFD4B8] chakana-pattern flex flex-col">
      {/* Header with status */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#FF8A50] flex items-center justify-center">
            <Volume2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#5D4037]">Kusi Voz</h1>
            <p className="text-sm text-[#5D4037]/70">Asistente de Voz</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Estado de síntesis de voz */}
          {isSupported && isSpeaking && (
            <div className="flex items-center gap-2 text-[#2196F3]">
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-medium">Hablando...</span>
            </div>
          )}
          
          {/* Estado de conexión */}
          {isOnline ? (
            <div className="flex items-center gap-2 text-[#4CAF50]">
              <Wifi className="w-6 h-6" />
              <span className="text-sm font-medium">En línea</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#FF8A50]">
              <WifiOff className="w-6 h-6" />
              <span className="text-sm font-medium">Sin conexión</span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {currentFeature ? (
          renderFeatureModule()
        ) : (
          <>
            {/* Subtitle display */}
            {subtitle && (
              <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur shadow-lg border-2 border-[#FF8A50]/20">
                <p className="text-3xl font-bold text-center text-[#5D4037] leading-relaxed">{subtitle}</p>
              </Card>
            )}

            {/* Confirmation buttons */}
            {showConfirmation && (
              <div className="flex gap-4">
                <Button
                  onClick={() => (pendingAction === "call" ? handleCallConfirm(true) : handleConfirm(true))}
                  className="h-20 px-12 text-2xl font-bold bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  size="lg"
                >
                  Sí
                </Button>
                <Button
                  onClick={() => (pendingAction === "call" ? handleCallConfirm(false) : handleConfirm(false))}
                  className="h-20 px-12 text-2xl font-bold bg-[#FF8A50] hover:bg-[#ff7a40] text-white"
                  size="lg"
                  variant="outline"
                >
                  No
                </Button>
              </div>
            )}

            {/* Main microphone button */}
            <div className="relative">
              <button
                onClick={handleMicPress}
                disabled={isListening || greeting}
                className={cn(
                  "w-48 h-48 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl",
                  "bg-gradient-to-br from-[#FF8A50] to-[#ff7a40]",
                  "hover:scale-105 active:scale-95",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  isListening && "animate-pulse scale-110",
                )}
              >
                <Mic className="w-24 h-24 text-white" strokeWidth={2.5} />
              </button>

              {/* Listening animation */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#FF8A50]/30 animate-ping" />
                  <div className="absolute inset-0 rounded-full bg-[#FF8A50]/20 animate-pulse" />
                </>
              )}
            </div>

            {/* Instruction text */}
            <div className="text-center">
              <p className="text-3xl font-bold text-[#5D4037] mb-2">Presione y hable</p>
              <p className="text-2xl text-[#5D4037]/70">Push to talk</p>
              
              {/* Botón para repetir saludo */}
              <Button
                onClick={repeatGreeting}
                variant="outline"
                size="lg"
                className="mt-4 h-16 px-8 text-xl font-bold border-2 border-[#FF8A50] text-[#FF8A50] hover:bg-[#FF8A50] hover:text-white"
              >
                <Volume2 className="w-6 h-6 mr-2" />
                {isSpeaking ? "Hablando..." : "Escuchar saludo"}
              </Button>
            </div>

            {/* Feature buttons */}
            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl mt-8">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Button
                    key={feature.id}
                    onClick={() => setCurrentFeature(feature.id)}
                    className={cn(
                      "h-32 flex flex-col items-center justify-center gap-3 text-white font-bold text-xl",
                      "hover:scale-105 transition-transform shadow-lg",
                      feature.color,
                    )}
                  >
                    <Icon className="w-12 h-12" strokeWidth={2.5} />
                    <span>{feature.label}</span>
                  </Button>
                )
              })}
            </div>

            {/* Error de permisos de audio */}
            {permissionError && (
              <Card className="w-full max-w-2xl p-6 bg-[#FF8A50]/10 border-2 border-[#FF8A50]">
                <div className="flex items-center gap-4">
                  <Volume2 className="w-8 h-8 text-[#FF8A50]" />
                  <div>
                    <p className="text-xl font-bold text-[#5D4037]">Audio no disponible</p>
                    <p className="text-lg text-[#5D4037]/70">{permissionError}</p>
                    <p className="text-sm text-[#5D4037]/60 mt-2">
                      Haz clic en "Repetir saludo" para intentar activar el audio
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Offline notice */}
            {!isOnline && (
              <Card className="w-full max-w-2xl p-6 bg-[#FF8A50]/10 border-2 border-[#FF8A50]">
                <div className="flex items-center gap-4">
                  <WifiOff className="w-8 h-8 text-[#FF8A50]" />
                  <div>
                    <p className="text-xl font-bold text-[#5D4037]">Sin conexión a internet</p>
                    <p className="text-lg text-[#5D4037]/70">Tus mensajes se enviarán cuando vuelva la conexión</p>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Footer with cultural pattern */}
      <footer className="p-6 border-t-4 border-[#5D4037]/10">
        <div className="flex items-center justify-center gap-2 text-[#5D4037]/60">
          <div className="w-8 h-8 border-2 border-[#5D4037]/30 rotate-45" />
          <p className="text-lg">Kusi significa "felicidad" en quechua</p>
          <div className="w-8 h-8 border-2 border-[#5D4037]/30 rotate-45" />
        </div>
      </footer>
    </div>
  )
}
