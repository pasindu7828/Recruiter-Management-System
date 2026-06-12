import logoPng from "../../assets/logo.png";

const footerBg = "rgb(47,28,89)";

const FooterLink = ({ href = "#", children }) => (
  <a
    href={href}
    className="inline-flex text-sm text-white/70 transition-colors hover:text-white"
  >
    {children}
  </a>
);

const SocialButton = ({ label, children, href = "#" }) => (
  <a
    href={href}
    aria-label={label}
    className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white/80 hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/30"
  >
    {children}
  </a>
);

export default function Footer() {
  return (
    <footer style={{ backgroundColor: footerBg }} className="text-white">
      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:w-[88%] sm:px-10 lg:w-[86%] lg:px-14">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: brand + contact */}
          <div className="lg:max-w-lg lg:flex-[0_0_34%]">
            <div className="flex items-center gap-3">
              <img
                src={logoPng}
                alt="HireHub logo"
                className="h-10 w-10 rounded-lg object-contain"
                width={40}
                height={40}
              />
              <div>
                <div className="text-base font-extrabold tracking-wide">
                  <span className="text-white">HIRE</span>
                  <span className="text-white/90">HUB</span>
                </div>
                <div className="text-xs text-white/60">Industry</div>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-6 text-white/70">
              Streamline your recruitment process with our comprehensive
              management system. Hire smarter, faster, and better.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M4 7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v9A3.5 3.5 0 0 1 16.5 20h-9A3.5 3.5 0 0 1 4 16.5v-9Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                    <path
                      d="M7 9.5 12 13l5-3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <div>
                  <div className="text-white/70">contact@rms.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M6.5 3.5h3l1.2 5.1-2.2 1.2c1.1 2.2 2.9 4 5.1 5.1l1.2-2.2 5.1 1.2v3A2.8 2.8 0 0 1 17.1 20C9.6 19.5 4.5 14.4 4 6.9A2.8 2.8 0 0 1 6.5 3.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      opacity="0.9"
                    />
                  </svg>
                </span>
                <div className="text-white/70">(+94) 77 1111 111</div>
              </div>

              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 22s7-4.7 7-11a7 7 0 1 0-14 0c0 6.3 7 11 7 11Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                    <path
                      d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
                      fill="currentColor"
                      opacity="0.9"
                    />
                  </svg>
                </span>
                <div className="text-white/70">Colombo, Sri Lanka</div>
              </div>
            </div>
          </div>

          {/* Right: columns */}
          <div className="flex flex-1 flex-wrap gap-x-12 gap-y-8 sm:justify-between lg:gap-x-14">
            <div className="min-w-[130px] space-y-3">
              <div className="text-sm font-semibold text-white">Product</div>
              <div className="flex flex-col gap-2">
                <FooterLink>Features</FooterLink>
                <FooterLink>Pricing</FooterLink>
                <FooterLink>Security</FooterLink>
                <FooterLink>Integrations</FooterLink>
              </div>
            </div>

            <div className="min-w-[130px] space-y-3">
              <div className="text-sm font-semibold text-white">Company</div>
              <div className="flex flex-col gap-2">
                <FooterLink>About Us</FooterLink>
                <FooterLink>Careers</FooterLink>
                <FooterLink>Blog</FooterLink>
                <FooterLink>Press</FooterLink>
              </div>
            </div>

            <div className="min-w-[130px] space-y-3">
              <div className="text-sm font-semibold text-white">Resources</div>
              <div className="flex flex-col gap-2">
                <FooterLink>Documentation</FooterLink>
                <FooterLink>Help Center</FooterLink>
                <FooterLink>Community</FooterLink>
              </div>
            </div>

            <div className="min-w-[130px] space-y-3">
              <div className="text-sm font-semibold text-white">Legal</div>
              <div className="flex flex-col gap-2">
                <FooterLink>Privacy Policy</FooterLink>
                <FooterLink>Terms of Services</FooterLink>
                <FooterLink>Cookie Policy</FooterLink>
                <FooterLink>Press</FooterLink>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-5 py-4 sm:w-[88%] sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:w-[86%] lg:px-14">
          <div className="text-xs text-white/65">
            © 2026 HIREHUB Industry. All rights reserved.
          </div>

          <div className="flex items-center gap-2">
            <SocialButton label="LinkedIn">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M6.9 6.8a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM5 21.5V9h3.8v12.5H5ZM10.8 9h3.6v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6v6.8h-3.8v-6c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6.1h-3.8V9Z" />
              </svg>
            </SocialButton>
            <SocialButton label="Facebook">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M13.8 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H17V4.8c-.3 0-1.4-.1-2.7-.1-2.7 0-4.6 1.6-4.6 4.6V11H7.1v3h2.6v8h4.1Z" />
              </svg>
            </SocialButton>
            <SocialButton label="Instagram">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-current"
              >
                <path
                  d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M17.5 6.5h.01"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </SocialButton>
          </div>
        </div>
      </div>
    </footer>
  );
}
