import { Phone, Mail, MapPin} from "lucide-react"
import Logo from "../assets/logo.png"
import { FaInstagram,  FaFacebookF, FaWhatsapp  } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        
        {/* Logo + Description */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src={Logo} alt="Zerosol Logo" className="w-[10rem]" />
          </div>

          <p className="text-sm text-gray-500 max-w-xs">
            The world's most trusted car comparison platform. Driven by data,
            refined for enthusiasts.
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Contact Us
          </h4>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-center gap-3">
              <Phone size={16} />
              +233 54 311 7135
            </div>

            <div className="flex items-center gap-3">
              <Mail size={16} />
              sales@zerosolfafrica.co
            </div>

            <div className="flex items-center gap-3">
              <MapPin size={16} />
              Accra, Ghana
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Connect
          </h4>

          <div className="flex gap-4 text-gray-700">
            <button className="hover:text-black"><FaInstagram size={18} /></button>
            <button className="hover:text-black"><FaFacebookF size={18} /></button>
            <button className="hover:text-black"><FaXTwitter size={18} /></button>
            <button className="hover:text-black"><FaWhatsapp size={18} /></button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        © 2026 Zerosol Fleets. All Rights Reserved. Professional car data provided
      </div>
    </footer>
  )
}
