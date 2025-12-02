import logo from "@/assets/img/logos-Footer-sistema-fecomercio-sesc-senac.png";

const Footer = () => (
  <footer className="bg-white border-t">
    <div className="container flex items-center justify-center">
      <img
        src={logo}
        alt="Fecomércio PR, Sesc, Senac e IFPD"
        className=" object-contain"
      />
    </div>
  </footer>
);

export default Footer;
