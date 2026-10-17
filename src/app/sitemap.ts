import { getAllBarbers } from "@/data/barbers";

export default function sitemap() {
  const baseUrl = "https://leonunesbarbearia.com.br";
  const barbers = getAllBarbers();
  const buildDate = "2026-10-17";

  const barberRoutes = barbers.map((b) => ({
    url: `${baseUrl}/agendar/${b.slug}`,
    lastModified: buildDate,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: buildDate,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/agendar`,
      lastModified: buildDate,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    ...barberRoutes,
  ];
}
