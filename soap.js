(function() {
    this.soap = (function() {
        var envelope_header, parametersToXML, request;

        function soap(settings) {
            this.settings = settings;
        }

        soap.prototype.execute = function(method, method_parameters) {
            var header, k, parameters, v, _ref;
            if (method_parameters == null) {
                method_parameters = {};
            }
            if (method == null) {
                return false;
            }
            if ((this.settings.defaultSettings == null) && !method_parameters) {
                return false;
            }
            parameters = {};
            _ref = this.settings.defaultSettings;
            for (k in _ref) {
                v = _ref[k];
                parameters[k] = v;
            }
            for (k in method_parameters) {
                v = method_parameters[k];
                parameters[k] = v;
            }
            header = envelope_header(method, parameters, this.settings);
            return request(method, this.settings.url, header);
        };

        request = function(method, url, header) {
            var xmlObject;
            xmlObject = false;
            $.ajax({
                type: "POST",
                dataType: "xml",
                processData: false,
                async: false,
                contentType: "application/soap+xml; charset=utf-8",
                url: url,
                data: header,
                cache: false,
                success: function(response, status) {
                    return xmlObject = response;
                },
                error: function(jqXHR, status, error) {
                    return false;
                }
            });
            return $("" + method + "Response", xmlObject)[0];
        };

        parametersToXML = function(params) {
            var attr, index, item, xml_string;
            xml_string = "";
            for (index in params) {
                if (params.hasOwnProperty(index)) {
                    attr = params[index];
                }
                switch (typeof attr) {
                    case "string":
                        attr.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                        break;
                    case "number":
                    case "boolean":
                        attr.toString();
                        break;
                    case "object":
                        if (attr instanceof Array) {
                            attr = ((function() {
                                var _i, _len, _results;
                                _results = [];
                                for (_i = 0, _len = attr.length; _i < _len; _i++) {
                                    item = attr[_i];
                                    _results.push(parametersToXML(item));
                                }
                                return _results;
                            })()).join('');
                        } else {
                            attr = parametersToXML(attr);
                        }
                }
                xml_string = xml_string + ("<" + index + ">" + attr + "</" + index + ">");
            }
            return xml_string;
        };

        envelope_header = function(method, parameters, settings) {
            parameters = parametersToXML(parameters);
            return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<soap12:Envelope xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:soap12=\"http://www.w3.org/2003/05/soap-envelope\" xmlns:a=\"http://www.w3.org/2005/08/addressing\">\n<soap12:Header>\n  <a:Action soap12:mustUnderstand=\"1\">" + settings.mustUnderstand + method + "</a:Action>\n  <a:To soap12:mustUnderstand=\"1\">" + settings.url + "</a:To>\n</soap12:Header>\n<soap12:Body>\n<" + method + " xmlns=\"" + settings.xmlns + "\">\n" + parameters + "\n</" + method + ">\n</soap12:Body>\n</soap12:Envelope>";
        };

        return soap;

    })();

}).call(this);