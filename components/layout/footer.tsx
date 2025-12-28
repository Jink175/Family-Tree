import { Diamond, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="" className="h-8 w-8 rounded-xl"/>
              <div>
                <h3 className="text-xl font-bold text-black">FAMILY TREE</h3>
                <p className="text-xs text-gray-600">Thước đo giá trị thực</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Trung tâm giám định ngọc học FAMILY TREE</p>
          </div>

          {/* LIULAB Navigation */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-black mb-4">FAMILY TREE</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Liên hệ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Tin tức
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Nghiên cứu khoa học
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Kiến thức
                </a>
              </li>
            </ul>
          </div>

          {/* Services Navigation */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-black mb-4">Dịch Vụ</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giám định đá quý - Bán quý
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giám định cẩm thạch
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giám định ngọc trai
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giám định tại hiện trường
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Giám định và phân cấp kim cương
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-black transition-colors">
                  Tư vấn ngọc học
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div className="md:col-span-1">
            <h4 className="font-semibold text-black mb-4">Thông tin liên hệ</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-600 shrink-0" />
                <span className="text-sm text-gray-600">028.22 61 88 99</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-600 shrink-0" />
                <span className="text-sm text-gray-600">contact@gemstone.edu.vn</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
                <div className="text-sm text-gray-600">
                  <p>572B/5 Trần Hưng Đạo,</p>
                  <p>Phường 2, Quận 5, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-500">All right reserved. ©FOSOSOFT2023</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer