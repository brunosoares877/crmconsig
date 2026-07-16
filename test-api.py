import urllib.request
import urllib.error
import socket

vps_ip = "179.197.78.30"
port = 8080
url = f"http://{vps_ip}:{port}/"

print(f"Testando {url}...")

# Teste de porta TCP primeiro
try:
    sock = socket.create_connection((vps_ip, port), timeout=8)
    sock.close()
    print(f"PORTA {port}: ABERTA - conexao TCP ok!")
except Exception as e:
    print(f"PORTA {port}: FECHADA ou filtrada - {e}")

# Teste HTTP
try:
    req = urllib.request.Request(url, headers={"apikey": "crmconsig2024secretkey"})
    with urllib.request.urlopen(req, timeout=10) as response:
        body = response.read(500).decode("utf-8", errors="ignore")
        print(f"HTTP STATUS: {response.status}")
        print(f"RESPOSTA: {body}")
        print("EVOLUTION API: ONLINE!")
except urllib.error.URLError as e:
    print(f"HTTP ERRO: {e.reason}")
except Exception as e:
    print(f"ERRO: {e}")
