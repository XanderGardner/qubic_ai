# qubic_ai

Preview: https://xandergardner.github.io/qubic_ai/

qubic_ai is a 3D version of tic-tac-toe. The game can be played against a **lookahead AI** with a chosen difficulty or against a friend. The site is built with 3JS to give **3D visuals** and works on mobile devices.


# development setup

The project development uses the recent stable releases: node v21.5.0 and npm v10.2.4. `nvm use stable`

Install project dependencies:
```
npm install
```

View index.html in a browser or run `npx serve`.

### making changes

Changes to javascript in scripts/ must be built with webpack:
```
npm run build
```

