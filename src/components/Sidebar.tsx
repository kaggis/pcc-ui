import { useAuth } from '@/auth/useAuth'
import {
  BookmarkIcon,
  BuildingLibraryIcon,
  FlagIcon,
  MagnifyingGlassIcon,
  TagIcon,
} from '@heroicons/react/16/solid'
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const { t } = useTranslation();
  const { authenticated } = useAuth();
  return (

    <nav id="sidebar-menu" className="text-[rgb(93,93,93)] text-lg">
      {authenticated && (
        <div id="sticky-sidebar">
          <h6 className="px-3 mt-4 mb-1">
            <small>
              <strong>{t("lbl_menu")}</strong>
            </small>
          </h6>
          <div className="ml-6">
            <ul>
              <li className="nav-item p-2">
                <NavLink to="prefixes" className="nav-link">
                  <TagIcon className="size-6 inline" /> {t("lbl_prefixes")}
                </NavLink>
              </li>
              <li className="nav-item p-2">
                <NavLink to="lookup" className="nav-link">
                  <MagnifyingGlassIcon className="size-6 inline" /> {t("lbl_lookup")}
                </NavLink>
              </li>
            </ul>
          </div>
          <h6 className="px-3 mt-4 mb-1">
            <small>
              <strong>{t("lbl_settings")}</strong>
            </small>
          </h6>
          <div className="ml-6">
            <ul className="nav flex-column text-start">
              <li className="nav-item p-2">
                <NavLink to="providers" className="nav-link">
                  <BuildingLibraryIcon className="size-6 inline" /> {t("lbl_providers")}
                </NavLink>
              </li>
              <li className="nav-item p-2">
                <NavLink to="services" className="nav-link">
                  <FlagIcon className="size-6 inline" /> {t("lbl_services")}
                </NavLink>
              </li>
              <li className="nav-item p-2">
                <NavLink to="domains" className="nav-link">
                  <BookmarkIcon className="size-6 inline" /> {t("lbl_domains")}
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Sidebar
