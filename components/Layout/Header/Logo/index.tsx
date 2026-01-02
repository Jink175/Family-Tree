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
        style={{ width: "10px", height: "10px" }}
        quality={100}
      />
    </Link>
  );
};

export default Logo;
