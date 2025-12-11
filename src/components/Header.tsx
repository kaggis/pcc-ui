import logo from '@/assets/logo.png'
import { useAuth } from '@/auth/useAuth'
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { authenticated, login, logout } = useAuth()
  return (
    <header>
      <div className="px-8 bg-[#264899] font-bold text-sm text-white">
        <div className="px-4 py-1 border-l border-r border-[#577cd5]">
          <div>
            <a href="http://www.eudat.eu" target="_blank" rel="noreferrer">
              {t("header_top_link")}
            </a>
          </div>
        </div>
      </div>
      <div id="header-main" className="px-8 py-2">
        <div className="flex flex-row">
          <div className="w-1/4 px-4">
            <a href="/">
              <img className="w-[150px]" src={logo} alt="PCC" />
            </a>
          </div>
          <div className="w-3/4">
            <nav className="flex items-center justify-center gap-12 px-4 py-3">
              <ul className="flex items-center gap-8 text-[#555] font-bold">
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    {t("nav_for_users")}
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                     {t("nav_about")}
                  </a>
                </li>
              </ul>

              <div>
                {!authenticated ? (
                  <button
                    type="button"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors cursor-pointer"
                    onClick={login}
                  >
                     {t("btn_login")}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-900 font-semibold rounded-md transition-colors cursor-pointer"
                    onClick={logout}
                  >
                     {t("btn_logout")}
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
