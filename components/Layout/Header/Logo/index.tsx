import Image from "next/image";
import Link from "next/link";

const Logo: React.FC = () => {
  return (
    <Link href="/">
      <Image
        src="/Logo.svg"
        alt="logo"
        width={135}
        height={32}
        style={{ width: "50px", height: "50px" }}
        quality={100}
        className="bg-white rounded-full"
      />
    </Link>
  );
};

export default Logo;
