package com.example.admin.config;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SPA fallback: forward non-API, non-static (no extension) routes to index.html so client-side router can handle them.
 */
@Controller
public class SpaRedirectController {

    @RequestMapping(value = {"/{path:[^\\.]*}", "/**/{path:[^\\.]*}"})
    public String redirect(HttpServletRequest request) {
        String uri = request.getRequestURI();
        if (uri.startsWith("/api") || uri.startsWith("/actuator")) {
            // Let backend controllers/actuator handle it
            return "forward:" + uri;
        }
        // Forward to SPA entry point
        return "forward:/index.html";
    }
}
