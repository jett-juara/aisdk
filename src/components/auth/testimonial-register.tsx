import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestimonialRegister() {
  return (
    <div className="flex flex-col" style={{ gap: "16px" }}>
      {/* Testimonial Text with Quote Icon */}
      <div className="flex flex-col" style={{ gap: "16px" }}>
        <div
          className="text-auth-button-brand opacity-70 font-serif"
          style={{ fontSize: "80px", lineHeight: "0", marginBottom: "0px" }}
        >
          &quot;
        </div>
        <p className="text-body-lg text-auth-text-primary leading-relaxed text-left">
          Platform JETT sangat membantu tim kami mengelola event dengan lebih efisien. Interface yang intuitif
          membuat semua proses jadi lebih cepat dan terorganisir.
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center justify-start" style={{ gap: "12px" }}>
        <Avatar
          className="w-12 h-12 bg-auth-button-brand"
          style={{ width: "48px", height: "48px", borderRadius: "24px" }}
        >
          <AvatarFallback className="bg-auth-button-brand text-auth-text-primary font-bold">AJ</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="text-auth-text-primary font-medium text-body">Andi Jaya</p>
          <p className="text-auth-text-muted text-body-sm">Event Manager</p>
        </div>
      </div>
    </div>
  )
}
