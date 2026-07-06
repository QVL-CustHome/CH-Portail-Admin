import { Divider, Link, Stack, useTranslation } from "@custhome/ui";
import { cguUrl } from "../lib/auth-redirect";

const LEGAL_NOTICE_ANCHOR = "mentions-legales";

export default function LegalLinks() {
  const { t } = useTranslation();

  return (
    <Stack
      as="nav"
      direction="row"
      gap="xs"
      alignItems="center"
      label={t("admin.legal.footerLabel")}
    >
      <Link href={cguUrl()} size="small" color="secondary">
        {t("admin.legal.cgu")}
      </Link>
      <Divider orientation="vertical" flexItem spacing="xs" />
      <Link href={cguUrl(LEGAL_NOTICE_ANCHOR)} size="small" color="secondary">
        {t("admin.legal.notice")}
      </Link>
    </Stack>
  );
}
