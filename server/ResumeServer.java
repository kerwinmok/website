import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

public class ResumeServer {
    private static final Map<String, String> CONTENT_TYPES = new HashMap<>();

    static {
        CONTENT_TYPES.put(".html", "text/html; charset=utf-8");
        CONTENT_TYPES.put(".css", "text/css; charset=utf-8");
        CONTENT_TYPES.put(".js", "application/javascript; charset=utf-8");
        CONTENT_TYPES.put(".json", "application/json; charset=utf-8");
        CONTENT_TYPES.put(".png", "image/png");
        CONTENT_TYPES.put(".jpg", "image/jpeg");
        CONTENT_TYPES.put(".jpeg", "image/jpeg");
        CONTENT_TYPES.put(".webp", "image/webp");
        CONTENT_TYPES.put(".svg", "image/svg+xml");
        CONTENT_TYPES.put(".txt", "text/plain; charset=utf-8");
        CONTENT_TYPES.put(".ico", "image/x-icon");
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getenv().getOrDefault("PORT", "8080"));
        Path publicDir = Paths.get("public").toAbsolutePath().normalize();

        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);
        server.createContext("/", exchange -> handleRequest(exchange, publicDir));
        server.setExecutor(null);

        System.out.println("Resume site running at http://localhost:" + port);
        System.out.println("Serving files from " + publicDir);
        server.start();
    }

    private static void handleRequest(HttpExchange exchange, Path publicDir) throws IOException {
        try {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendText(exchange, 405, "Method Not Allowed");
                return;
            }

            String rawPath = exchange.getRequestURI().getPath();
            String safePath = (rawPath == null || rawPath.isBlank() || "/".equals(rawPath))
                ? "index.html"
                : rawPath.substring(1);

            Path requested = publicDir.resolve(safePath).normalize();

            // Block path traversal by forcing all requests to remain under /public.
            if (!requested.startsWith(publicDir)) {
                sendText(exchange, 403, "Forbidden");
                return;
            }

            if (Files.isDirectory(requested)) {
                requested = requested.resolve("index.html");
            }

            if (!Files.exists(requested)) {
                sendText(exchange, 404, "Not Found");
                return;
            }

            byte[] body = Files.readAllBytes(requested);
            String contentType = resolveContentType(requested);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.sendResponseHeaders(200, body.length);

            try (OutputStream os = exchange.getResponseBody()) {
                os.write(body);
            }
        } finally {
            exchange.close();
        }
    }

    private static void sendText(HttpExchange exchange, int statusCode, String message) throws IOException {
        byte[] body = message.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(statusCode, body.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(body);
        }
    }

    private static String resolveContentType(Path file) {
        String name = file.getFileName().toString().toLowerCase();
        int dot = name.lastIndexOf('.');
        if (dot < 0) {
            return "application/octet-stream";
        }
        String ext = name.substring(dot);
        return CONTENT_TYPES.getOrDefault(ext, "application/octet-stream");
    }
}
