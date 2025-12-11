import { useAuth } from '@/auth/useAuth';
import { UserIcon } from '@heroicons/react/16/solid';
import { useTranslation } from "react-i18next";

const Home = () => {
    const { t } = useTranslation();
    const { authenticated, login, profile } = useAuth();


    return (
        <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">{t("msg_welcome")}</h1>
            {
                !authenticated ?
                    <div className="min-h-[50vh] mt-8">
                        <div>
                            <p>{t("please")}<button
                                type="button"
                                className="px-4 py-2 my-2 mx-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors cursor-pointer"
                                onClick={login}
                            >
                                {t("btn_login")}
                            </button> {t("msg_see_options")} </p>
                        </div>
                    </div>
                :   <div className="min-h-[50vh] mt-8"> 
                        <div>{t("msg_welcome_user")} <span className="rounded bg-amber-50 p-1"><UserIcon className="size-4 inline-block" /> <code>{profile?.sub}</code></span></div> 
                        <div>{t("msg_use_options")}</div>
                    </div>

            }
        </div>
    )
}

export default Home
