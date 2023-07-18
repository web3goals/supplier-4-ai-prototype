# 🤝 Supplier 4 AI

Earn crypto by supplying your own data to AI for learning.

## 🔗 Application

https://supplier-4-ai-app.vercel.app/

## 🔥 The problem it solves

Today, developers use huge amounts of public data to train AI. But the authors of this data are not compensated for using it.

To solve this problem, I built a web3 application where you can earn crypto by supplying your own data to AI for learning.

## 🏔️ Challenges I ran into

There was a problem with integrating AntiSybil SDK into NextJS project because of the error "window is not defined". But I managed to solve it using dynamic loading without SSR.

I also faced an error while deploying contracts to Mantle Testnet using Hardhat. But manually defining gas price and gas limit helped me.

## ⚒️ Technologies I used

To make it, I used:

- Mantle Network to provide features to supply and purchase data using smart contracts.
- zkMe as anti-sybil guard that prevents bots with fake data.
- Moralis to retrieve data with user tokens for supply.
- Kwil for storing data in a form suitable for AI training.
- Particle Network for more convenient and faster login of users.

## 🧠 Contracts (Mantle Testnet)

- Profile - 0x7A4ba8c3eA0524D4b1240d4eEbdDa3e2bfE4c87B
- DataSupplier - 0x539dA825856778B593a55aC4E8A0Ec1441f18e78

## 🚀 Plans

There are many ideas on how to improve this project. It would be great to:

- Integrate web2 services for artists, such as Artstation.
- Improve the UI to support large amounts of tokens.
- Connect Reddit and other social networks to provide text data so that authors can earn, too.
- And collaborate with big AI companies.

## 🏗️ Architecture

![Architecture](/architecture.png)
