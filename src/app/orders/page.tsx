import Footer from "@/common/components/layouts/FooterMenu";
import HeaderBottom from "@/common/components/layouts/HeaderBottom";
import HeaderTop from "@/common/components/layouts/HeaderTop";
import Navigation from "@/common/components/layouts/Navigation";
import Account from "@/components/Account"
import Orders from "@/components/Orders";

const Page = () =>{
    return (
        <>
        <HeaderTop/>
        <HeaderBottom/>
        <Navigation/>
        <Orders/>
        <Footer/>
        </>
    )
}
export default Page;