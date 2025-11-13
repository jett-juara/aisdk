import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestimonialLogin() {
  return (
    <div className="flex flex-col gap-4">
      {/* Testimonial Text with Quote */}
      <div className="flex flex-col gap-4 w-full max-w-[50vw]">
        <div className="font-serif text-[12rem] leading-[0] mb-0 text-text-50 opacity-20">
          &quot;
        </div>
        <p className="font-subheading font-thin lg:text-xl leading-tight text-left text-text-info-500">
          Sistem keamanan JETT sangat membantu saya melindungi data penting bisnis. Interface yang intuitif membuat
          semua proses jadi lebih cepat dan efisien.
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center justify-start gap-3 mt-4">
        <Avatar className="w-12 h-12 bg-background-700 rounded-full">
          <AvatarFallback className="bg-button-primary text-text-200 text-2xl font-bold">
            RS
          </AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="font-medium text-body text-text-100 text-sm">
            Rina Santoso
          </p>
          <p className="text-body text-text-100 text-xs">
            CEO Tech Solutions
          </p>
        </div>
      </div>
    </div>
  )
}
