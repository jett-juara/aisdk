import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestimonialLogin() {
  return (
    <div className="flex flex-col gap-4">
      {/* Testimonial Text with Quote Icon */}
      <div className="flex flex-col gap-4">
        <div className="font-serif text-9xl leading-[0] mb-0 text-text-50 opacity-20">
          &quot;
        </div>
        <p className="font-heading text-2xl leading-tight text-left text-text-info-500">
          Sistem keamanan JETT sangat membantu saya melindungi data penting bisnis. Interface yang intuitif membuat
          semua proses jadi lebih cepat dan efisien.
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center justify-start gap-3">
        <Avatar className="w-12 h-12 bg-background-700 rounded-full">
          <AvatarFallback className="bg-background-600 text-text-400 text-2xl font-bold">
            RS
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="font-medium text-body text-text-100 text-lg">
            Rina Santoso
          </p>
          <p className="text-body text-text-100 text-md">
            CEO Tech Solutions
          </p>
        </div>
      </div>
    </div>
  )
}
