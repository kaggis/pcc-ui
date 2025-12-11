import logo from '@/assets/footer-logo.svg' // relative path to image
import { useTranslation } from 'react-i18next';
const Footer = () => {

  const { t } = useTranslation();
  

  return (
    <footer>
      <div className="footer-main text-xs bg-[#2c2c2c] text-white">
        <div className="flex flex-row px-4 py-2">
          <div className="w-1/2">
            <div className="footer-logo footer-eudat-logo">
              <img className="w-[200px]" src={logo} alt="PCC" />
            </div>
            <div className="footer-logo">
              {t("footer_copyright")}{' '}
            </div>
          </div>
          <div className="w-1/2">
            <nav>
              <ul id="nav-menu" className="flex flex-wrap gap-4 justify-end">
                <li>
                  <a
                    href="https://www.eudat.eu/eudat-cdi-aup"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {t("footer_tou")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {t("footer_privacy")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                     {t("footer_legal")}
                  </a>
                </li>
                <li>
                  <a
                    href="https://eudat.eu/eudat-cdi"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                     {t("footer_about")}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        <hr className="opacity-25" />
        <div className="flex flex-row px-4 py-2">
          <div className="w-2/3">
            <div>
              {t("footer_desc")}
            </div>
          </div>
          <div className="w-1/3">
            <div className="text-end">
              <a
                href="https://www.grnet.gr"
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                {t("footer_powered_by")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
