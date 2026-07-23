package com.example.documentai.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ForwardingController {

    @GetMapping(value = {"/", "/{path:^(?!api|static|.*\\.\\w+$).*$}"})
    public String index() {
        return "forward:/index.html";
    }
}
