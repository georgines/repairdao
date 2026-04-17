import { Button, Card, Group, Stack, Title } from "@mantine/core";

export default function Home() {
  return (
    <Card
      radius="sm"
      withBorder
      shadow="none"
      padding="lg"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        borderColor: "rgba(15, 23, 42, 0.08)",
      }}
    >
      <Stack gap="lg">
        <Title order={1}>Economia inicial do RepairDAO</Title>

        <Group justify="space-between" align="center">
          <Button component="a" href="/store" size="md" radius="sm">
            Ir para a loja
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
