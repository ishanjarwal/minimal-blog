export const siteConfig = {
  author: {
    name: "Ishan Jarwal",
    handle: "ishanjarwal",
    title: "Software Engineer & AI Product Engineer",
    avatarUrl:
      "https://res.cloudinary.com/dsf4t9wmc/image/upload/v1793566827/Dramatic_Studio_Portrait_of_a_Bearded_Man_bz7h1u.png",
    portfolioUrl: "https://ishanjarwal.com",
    githubUrl: "https://github.com/ishanjarwal",
    linkedinUrl: "https://linkedin.com/in/ishanjarwal",
    twitterUrl: "https://x.com/ishanjarwal",
    email: "ishucodes@gmail.com",
    resumeUrl:
      "https://drive.google.com/file/d/1UOzxtJMxCTc2niLB4nXmlvyAopPVo9mJ/view?usp=sharing",
  },
  blog: {
    name: "Ishan Jarwal's Blog",
    subheading: "Systems, Distributed Architecture & Agentic AI",
    description:
      "A developer-first technical blog covering distributed systems, Linux internals, LLM reasoning, and full-stack engineering.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://blog.myportfolio.com",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Tags", href: "/tag" },
    { label: "Write", href: "/write", adminOnly: true },
    { label: "Portfolio ↗", href: "https://ishanjarwal.com", external: true },
  ],
};
