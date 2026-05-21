#!/bin/bash
# Setup script para Mac/Linux

echo "[Step 1] Instalando dependências do servidor..."
cd server
npm install
cd ..

echo ""
echo "[Step 2] Instalando dependências do cliente..."
npm install

echo ""
echo "========================================"
echo "✅ Instalação completa!"
echo "========================================"
echo ""
echo "Para iniciar o sistema:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  npm run dev"
echo ""
echo "Ou use um terminal único:"
echo "  npm run dev:with-server"
echo ""
