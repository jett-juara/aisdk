import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function TestimonialRegister() {
  return (
    <div className="flex flex-col gap-4">
      {/* Testimonial Text with Quote */}
      <div className="flex flex-col gap-4 w-full max-w-[50vw]">
        <div className="font-serif text-[12rem] leading-[0] mb-0 text-text-50 opacity-20">
          &quot;
        </div>
        <p className="font-subheading font-thin lg:text-xl leading-tight text-left text-text-info-500">
          Platform JETT sangat membantu tim kami mengelola event dengan lebih efisien. Interface yang intuitif
          membuat semua proses jadi lebih cepat dan terorganisir.
        </p>
      </div>

      {/* Author */}
      <div className="flex items-center justify-start gap-3 mt-4">
        <Avatar className="w-12 h-12 bg-button-primary rounded-full">
          <AvatarFallback className="bg-button-primary text-text-50 font-bold">AJ</AvatarFallback>
        </Avatar>
        <div className="text-left">
          <p className="font-medium text-body text-text-100 text-sm">Andi Jaya</p>
          <p className="text-body text-text-100 text-xs">Event Manager</p>
        </div>
      </div>
    </div>
  )
}
