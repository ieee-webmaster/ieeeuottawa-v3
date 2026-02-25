type Args = {
    href: string
}

export const SignUpButton = ({ href }: Args) => {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm inline-flex items-center min-h-12"
    >
      Sign Up / Learn More
    </a>
  );
};