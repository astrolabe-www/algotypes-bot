"use strict";

const needle = require("needle");
const { cards } = require("./cards.js");
const querystring = require("querystring");

const TXTS = {
  intro: {
    en: "Your algorithm today is:",
    pt: "O seu algoritmo de hoje é:",
  },
  outro: {
    en: "🔮 Come back tomorrow for a new algorithm 🔮",
    pt: "🔮 Volte amanhã para uma nova mensagem 🔮",
  },
};

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now - start;
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return day;
}

function dailyRandom(mSeed) {
  const x = Math.sin(mSeed) * 1e4;
  return x - Math.floor(x);
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function send(what) {
  const botId = `bot${process.env.TELEGRAM_API_TOKEN}`;
  const endPoint = `send${capitalize(what)}`;

  return async (params) => {
    const qs = querystring.stringify(params);
    return needle("get", `https://api.telegram.org/${botId}/${endPoint}?${qs}`);
  };
}

async function botReply(msg, lang) {
  const userDailyRandom = dailyRandom(msg.from.id + dayOfYear());
  const mIndex = Math.floor(cards.length * userDailyRandom);
  const mCard = cards[mIndex];

  await send("message")({
    chat_id: msg.chat.id,
    text: `${TXTS.intro[lang]}\n${mCard.name[lang]}`,
  });

  await send("sticker")({
    chat_id: msg.chat.id,
    sticker: mCard.sticker_id,
  });

  await send("message")({
    chat_id: msg.chat.id,
    text: `${mCard.message[lang]}`,
  });

  await send("message")({
    chat_id: msg.chat.id,
    text: `${TXTS.outro[lang]}`,
  });
}

module.exports.drawCard = async (event) => {
  const body = JSON.parse(event.body);
  const { text } = body.message;

  if (text == "/draw") {
    await botReply(body.message, "en");
  } else if (text == "/carta") {
    await botReply(body.message, "pt");
  }

  return { statusCode: 200 };
};
