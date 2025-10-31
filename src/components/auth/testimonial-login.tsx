import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestimonialLogin() {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      {/* Testimonial Text with Quote Icon */}
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div
          className="font-serif"
          style={{
            fontSize: "80px",
            lineHeight: "0",
            marginBottom: "0px",
            color: "var(--color-auth-button-brand)",
            opacity: "0.7"
          }}
        >
          "
        </div>
        <p
          className="text-body-lg leading-relaxed text-left"
          style={{ color: "var(--color-auth-text-primary)" }}
        >
          Sistem keamanan JETT sangat membantu saya melindungi data penting bisnis. Interface yang intuitif membuat
          semua proses jadi lebih cepat dan efisien.
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center justify-start" style={{ gap: "12px" }}>
        <Avatar
          className="w-12 h-12"
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "24px",
            backgroundColor: "var(--color-auth-button-brand)"
          }}
        >
          <AvatarFallback
            className="font-bold"
            style={{
              backgroundColor: "var(--color-auth-button-brand)",
              color: "var(--color-auth-text-primary)"
            }}
          >
            RS
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p
            className="font-medium text-body"
            style={{ color: "var(--color-auth-text-primary)" }}
          >
            Rina Santoso
          </p>
          <p
            className="text-body-sm"
            style={{ color: "var(--color-auth-text-muted)" }}
          >
            CEO Tech Solutions
          </p>
        </div>
      </div>
    </div>
  )
}
