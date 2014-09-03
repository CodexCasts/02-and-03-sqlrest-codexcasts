function Migrator(config, transactionDb) {
    this.db = transactionDb;
    this.dbname = config.adapter.db_name;
    this.table = config.adapter.collection_name;
    this.idAttribute = config.adapter.idAttribute;
    this.column = function(name) {
        var parts = name.split(/\s+/), type = parts[0];
        switch (type.toLowerCase()) {
          case "string":
          case "varchar":
          case "date":
          case "datetime":
            Ti.API.warn('"' + type + '" is not a valid sqlite field, using TEXT instead');

          case "text":
            type = "TEXT";
            break;

          case "int":
          case "tinyint":
          case "smallint":
          case "bigint":
          case "boolean":
            Ti.API.warn('"' + type + '" is not a valid sqlite field, using INTEGER instead');

          case "integer":
            type = "INTEGER";
            break;

          case "double":
          case "float":
          case "decimal":
          case "number":
            Ti.API.warn('"' + name + '" is not a valid sqlite field, using REAL instead');

          case "real":
            type = "REAL";
            break;

          case "blob":
            type = "BLOB";
            break;

          case "null":
            type = "NULL";
            break;

          default:
            type = "TEXT";
        }
        parts[0] = type;
        return parts.join(" ");
    };
    this.createTable = function(config) {
        var columns = [], found = !1;
        for (var k in config.columns) {
            k === this.idAttribute && (found = !0);
            columns.push(k + " " + this.column(config.columns[k]));
        }
        !found && this.idAttribute === ALLOY_ID_DEFAULT && columns.push(ALLOY_ID_DEFAULT + " TEXT");
        var sql = "CREATE TABLE IF NOT EXISTS " + this.table + " ( " + columns.join(",") + ")";
        this.db.execute(sql);
    };
    this.dropTable = function() {
        this.db.execute("DROP TABLE IF EXISTS " + this.table);
    };
    this.insertRow = function(columnValues) {
        var columns = [], values = [], qs = [], found = !1;
        for (var key in columnValues) {
            key === this.idAttribute && (found = !0);
            columns.push(key);
            values.push(columnValues[key]);
            qs.push("?");
        }
        if (!found && this.idAttribute === ALLOY_ID_DEFAULT) {
            columns.push(this.idAttribute);
            values.push(guid());
            qs.push("?");
        }
        this.db.execute("INSERT INTO " + this.table + " (" + columns.join(",") + ") VALUES (" + qs.join(",") + ");", values);
    };
    this.deleteRow = function(columns) {
        var sql = "DELETE FROM " + this.table, keys = _.keys(columns), len = keys.length, conditions = [], values = [];
        len && (sql += " WHERE ");
        for (var i = 0; len > i; i++) {
            conditions.push(keys[i] + " = ?");
            values.push(columns[keys[i]]);
        }
        sql += conditions.join(" AND ");
        this.db.execute(sql, values);
    };
}

function apiCall(_options, _callback) {
    if (Ti.Network.online && !_options.localOnly) {
        var xhr = Ti.Network.createHTTPClient({
            timeout: _options.timeout || 7e3
        });
        xhr.open(_options.type, _options.url);
        xhr.onload = function() {
            var responseJSON, error, success = true;
            try {
                responseJSON = JSON.parse(xhr.responseText);
            } catch (e) {
                Ti.API.error("[SQL REST API] apiCall PARSE ERROR: " + e.message);
                Ti.API.error("[SQL REST API] apiCall PARSE ERROR: " + xhr.responseText);
                success = false;
                error = e.message;
            }
            _callback({
                success: success,
                status: success ? 200 == xhr.status ? "ok" : xhr.status : "error",
                code: xhr.status,
                data: error,
                responseText: xhr.responseText || null,
                responseJSON: responseJSON || null
            });
        };
        xhr.onerror = function(err) {
            var responseJSON, error;
            try {
                responseJSON = JSON.parse(xhr.responseText);
            } catch (e) {
                error = e.message;
            }
            _callback({
                success: false,
                status: "error",
                code: xhr.status,
                error: err.error,
                data: error,
                responseText: xhr.responseText,
                responseJSON: responseJSON || null
            });
            Ti.API.error("[SQL REST API] apiCall ERROR: " + xhr.responseText);
            Ti.API.error("[SQL REST API] apiCall ERROR CODE: " + xhr.status);
            Ti.API.error("[SQL REST API] apiCall ERROR MSG: " + err.error);
        };
        for (var header in _options.headers) xhr.setRequestHeader(header, _options.headers[header]);
        _options.beforeSend && _options.beforeSend(xhr);
        xhr.send(_options.data || null);
    } else _callback({
        success: false,
        responseText: null,
        offline: true
    });
}

function Sync(method, model, opts) {
    function saveData(data) {
        data || isCollection || (data = model.toJSON());
        if (!data) return;
        if (_.isArray(data)) {
            var currentModels = sqlCurrentModels();
            for (var i in data) _.isUndefined(data[i]["is_deleted"]) ? -1 != _.indexOf(currentModels, data[i][model.idAttribute]) ? updateSQL(data[i]) : createSQL(data[i]) : deleteSQL(data[i][model.idAttribute]);
        } else {
            if (_.isUndefined(data["is_deleted"])) return 1 == sqlFindItem(data[model.idAttribute]).length ? updateSQL(data) : createSQL(data);
            deleteSQL(data[model.idAttribute]);
        }
    }
    function createSQL(data) {
        var attrObj = {};
        if (DEBUG) {
            Ti.API.debug("[SQL REST API] createSQL data:");
            Ti.API.debug(data);
        }
        data ? attrObj = data : isCollection ? Ti.API.error("[SQL REST API] Its a collection - error !") : attrObj = model.toJSON();
        if (!attrObj[model.idAttribute]) if (model.idAttribute === ALLOY_ID_DEFAULT) {
            attrObj.id = guid();
            attrObj[model.idAttribute] = attrObj.id;
        } else attrObj[model.idAttribute] = null;
        if (useStrictValidation) for (var c in columns) {
            if (c == model.idAttribute) continue;
            if (!_.contains(_.keys(attrObj), c)) {
                Ti.API.error("[SQL REST API] ITEM NOT VALID - REASON: " + c + " is not present");
                return;
            }
        }
        var names = [], values = [], q = [];
        for (var k in columns) {
            names.push(k);
            values.push(_.isObject(attrObj[k]) ? JSON.stringify(attrObj[k]) : attrObj[k]);
            q.push("?");
        }
        lastModifiedColumn && _.isUndefined(params.disableLastModified) && (values[_.indexOf(names, lastModifiedColumn)] = moment().format(lastModifiedDateFormat ? lastModifiedDateFormat : "YYYY-MM-DD HH:mm:ss"));
        var sqlInsert = "INSERT INTO " + table + " (" + names.join(",") + ") VALUES (" + q.join(",") + ");";
        db = Ti.Database.open(dbName);
        db.execute("BEGIN;");
        db.execute(sqlInsert, values);
        if (null === model.id) {
            var sqlId = "SELECT last_insert_rowid();";
            var rs = db.execute(sqlId);
            if (rs.isValidRow()) {
                model.id = rs.field(0);
                attrObj[model.idAttribute] = model.id;
            } else Ti.API.warn("Unable to get ID from database for model: " + model.toJSON());
        }
        db.execute("COMMIT;");
        db.close();
        return attrObj;
    }
    function readSQL(data) {
        DEBUG && Ti.API.debug("[SQL REST API] readSQL");
        var sql = opts.query || "SELECT * FROM " + table;
        if (params.returnExactServerResponse && data) {
            opts.sql = opts.sql || {};
            opts.sql.where = opts.sql.where || {};
            if (_.isEmpty(data)) opts.sql.where.id = "1=2"; else {
                var ids = [];
                _.each(data, function(element) {
                    ids.push(element[model.idAttribute]);
                });
                opts.sql.where.id = ids;
            }
        }
        db = Ti.Database.open(dbName);
        if (opts.query) var rs = db.execute(opts.query.sql, opts.query.params); else {
            if (opts.data) {
                opts.sql = opts.sql || {};
                opts.sql.where = opts.sql.where || {};
                _.extend(opts.sql.where, opts.data);
            }
            var sql = _buildQuery(table, opts.sql || opts);
            DEBUG && Ti.API.debug("[SQL REST API] SQL QUERY: " + sql);
            var rs = db.execute(sql);
        }
        var len = 0;
        var values = [];
        while (rs.isValidRow()) {
            var o = {};
            var fc = 0;
            fc = _.isFunction(rs.fieldCount) ? rs.fieldCount() : rs.fieldCount;
            _.times(fc, function(c) {
                var fn = rs.fieldName(c);
                o[fn] = rs.fieldByName(fn);
            });
            values.push(o);
            if (isCollection) {
                var m = new model.config.Model(o);
                model.models.push(m);
            }
            len++;
            rs.next();
        }
        rs.close();
        db.close();
        model.length = len;
        DEBUG && Ti.API.debug("readSQL length: " + len);
        return resp = 1 === len ? values[0] : values;
    }
    function updateSQL(data) {
        var attrObj = {};
        if (DEBUG) {
            Ti.API.debug("updateSQL data:");
            Ti.API.debug(data);
        }
        data ? attrObj = data : isCollection ? Ti.API.error("Its a collection - error!") : attrObj = model.toJSON();
        var names = [], values = [], q = [];
        for (var k in columns) if (!_.isUndefined(attrObj[k])) {
            names.push(k + "=?");
            values.push(_.isObject(attrObj[k]) ? JSON.stringify(attrObj[k]) : attrObj[k]);
            q.push("?");
        }
        var sql = "UPDATE " + table + " SET " + names.join(",") + " WHERE " + model.idAttribute + "=?";
        values.push(attrObj[model.idAttribute]);
        if (DEBUG) {
            Ti.API.debug("updateSQL sql: " + sql);
            Ti.API.debug(values);
        }
        db = Ti.Database.open(dbName);
        db.execute(sql, values);
        if (lastModifiedColumn && _.isUndefined(params.disableLastModified)) {
            var updateSQL = "UPDATE " + table + " SET " + lastModifiedColumn + " = DATETIME('NOW') WHERE " + model.idAttribute + "=?";
            db.execute(updateSQL, attrObj[model.idAttribute]);
        }
        db.close();
        return attrObj;
    }
    function deleteSQL(id) {
        var sql = "DELETE FROM " + table + " WHERE " + model.idAttribute + "=?";
        db = Ti.Database.open(dbName);
        db.execute(sql, id || model.id);
        db.close();
        model.id = null;
        return model.toJSON();
    }
    function deleteAllSQL() {
        var sql = "DELETE FROM " + table;
        db = Ti.Database.open(dbName);
        db.execute(sql);
        db.close();
    }
    function sqlCurrentModels() {
        var sql = "SELECT " + model.idAttribute + " FROM " + table;
        db = Ti.Database.open(dbName);
        var rs = db.execute(sql);
        var output = [];
        while (rs.isValidRow()) {
            output.push(rs.fieldByName(model.idAttribute));
            rs.next();
        }
        rs.close();
        db.close();
        return output;
    }
    function sqlFindItem(_id) {
        var sql = "SELECT " + model.idAttribute + " FROM " + table + " WHERE " + model.idAttribute + "=?";
        db = Ti.Database.open(dbName);
        var rs = db.execute(sql, _id);
        var output = [];
        while (rs.isValidRow()) {
            output.push(rs.fieldByName(model.idAttribute));
            rs.next();
        }
        rs.close();
        db.close();
        return output;
    }
    function sqlLastModifiedItem() {
        if (singleModelRequest || !isCollection) var sql = "SELECT " + lastModifiedColumn + " FROM " + table + " WHERE " + lastModifiedColumn + " IS NOT NULL AND " + model.idAttribute + "=" + singleModelRequest + " ORDER BY " + lastModifiedColumn + " DESC LIMIT 0,1"; else var sql = "SELECT " + lastModifiedColumn + " FROM " + table + " WHERE " + lastModifiedColumn + " IS NOT NULL ORDER BY " + lastModifiedColumn + " DESC LIMIT 0,1";
        db = Ti.Database.open(dbName);
        rs = db.execute(sql);
        var output = null;
        rs.isValidRow() && (output = rs.field(0));
        rs.close();
        db.close();
        return output;
    }
    function parseJSON(_response, parentNode) {
        var data = _response.responseJSON;
        _.isUndefined(parentNode) || (data = _.isFunction(parentNode) ? parentNode(data) : traverseProperties(data, parentNode));
        if (DEBUG) {
            Ti.API.info("[SQL REST API] server response: ");
            Ti.API.debug(data);
        }
        return data;
    }
    var db, table = model.config.adapter.collection_name, columns = model.config.columns, dbName = model.config.adapter.db_name || ALLOY_DB_DEFAULT, resp = null;
    model.idAttribute = model.config.adapter.idAttribute;
    var DEBUG = model.config.debug;
    var lastModifiedColumn = model.config.adapter.lastModifiedColumn;
    var addModifedToUrl = model.config.adapter.addModifedToUrl;
    var lastModifiedDateFormat = model.config.adapter.lastModifiedDateFormat;
    var parentNode = model.config.parentNode;
    var useStrictValidation = model.config.useStrictValidation;
    var initFetchWithLocalData = model.config.initFetchWithLocalData;
    var deleteAllOnFetch = model.config.deleteAllOnFetch;
    var isCollection = model instanceof Backbone.Collection ? true : false;
    var returnErrorResponse = model.config.returnErrorResponse;
    var singleModelRequest = null;
    if (lastModifiedColumn) {
        opts.sql && opts.sql.where && (singleModelRequest = opts.sql.where[model.idAttribute]);
        !singleModelRequest && opts.data && opts.data[model.idAttribute] && (singleModelRequest = opts.data[model.idAttribute]);
    }
    var methodMap = {
        create: "POST",
        read: "GET",
        update: "PUT",
        "delete": "DELETE"
    };
    var type = methodMap[method];
    var params = _.extend({}, opts);
    params.type = type;
    params.headers = params.headers || {};
    if (model.config.hasOwnProperty("headers")) for (header in model.config.headers) params.headers[header] = model.config.headers[header];
    if (!params.url) {
        params.url = model.config.URL || model.url();
        if (!params.url) {
            Ti.API.error("[SQL REST API] ERROR: NO BASE URL");
            return;
        }
    }
    if (lastModifiedColumn && _.isUndefined(params.disableLastModified)) {
        var lastModifiedValue = "";
        try {
            lastModifiedValue = sqlLastModifiedItem();
        } catch (e) {
            DEBUG && Ti.API.debug("[SQL REST API] LASTMOD SQL FAILED: ");
        }
        params.headers["Last-Modified"] = lastModifiedValue;
    }
    if (Alloy.Backbone.emulateJSON) {
        params.contentType = "application/x-www-form-urlencoded";
        params.processData = true;
        params.data = params.data ? {
            model: params.data
        } : {};
    }
    if (Alloy.Backbone.emulateHTTP && ("PUT" === type || "DELETE" === type)) {
        Alloy.Backbone.emulateJSON && (params.data._method = type);
        params.type = "POST";
        params.beforeSend = function() {
            params.headers["X-HTTP-Method-Override"] = type;
        };
    }
    params.headers["Content-Type"] = "application/json";
    DEBUG && Ti.API.debug("[SQL REST API] REST METHOD: " + method);
    switch (method) {
      case "create":
        params.data = JSON.stringify(model.toJSON());
        if (DEBUG) {
            Ti.API.info("[SQL REST API] options: ");
            Ti.API.info(params);
        }
        apiCall(params, function(_response) {
            if (_response.success) {
                var data = parseJSON(_response, parentNode);
                resp = saveData(data);
                _.isFunction(params.success) && params.success(resp);
            } else {
                resp = saveData();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
        break;

      case "read":
        !isCollection && model.id && (params.url = params.url + "/" + model.id);
        if (params.search) {
            params.returnExactServerResponse = true;
            params.url = params.url + "/search/" + Ti.Network.encodeURIComponent(params.search);
        }
        params.urlparams && (params.url = encodeData(params.urlparams, params.url));
        if (lastModifiedColumn && addModifedToUrl && lastModifiedValue) {
            var obj = {};
            obj[lastModifiedColumn] = lastModifiedValue;
            params.url = encodeData(obj, params.url);
        }
        if (DEBUG) {
            Ti.API.info("[SQL REST API] options: ");
            Ti.API.info(params);
        }
        if (!params.localOnly && (params.initFetchWithLocalData || initFetchWithLocalData)) {
            resp = readSQL();
            _.isFunction(params.success) && params.success(resp);
            model.trigger("fetch", {
                serverData: false
            });
        }
        apiCall(params, function(_response) {
            if (_response.success) {
                deleteAllOnFetch && deleteAllSQL();
                var data = parseJSON(_response, parentNode);
                _.isUndefined(params.localOnly) && saveData(data);
                resp = readSQL(data);
                _.isFunction(params.success) && params.success(resp);
                model.trigger("fetch");
            } else {
                resp = readSQL();
                if (_.isUndefined(_response.offline)) _.isFunction(params.error) && params.error(returnErrorResponse ? _response : resp); else {
                    _.isFunction(params.success) && params.success(resp);
                    model.trigger("fetch");
                }
            }
        });
        break;

      case "update":
        if (!model.id) {
            params.error(null, "MISSING MODEL ID");
            Ti.API.error("[SQL REST API] ERROR: MISSING MODEL ID");
            return;
        }
        if (-1 == _.indexOf(params.url, "?")) params.url = params.url + "/" + model.id; else {
            var str = params.url.split("?");
            params.url = str[0] + "/" + model.id + "?" + str[1];
        }
        params.urlparams && (params.url = encodeData(params.urlparams, params.url));
        params.data = JSON.stringify(model.toJSON());
        if (DEBUG) {
            Ti.API.info("[SQL REST API] options: ");
            Ti.API.info(params);
        }
        apiCall(params, function(_response) {
            if (_response.success) {
                var data = parseJSON(_response, parentNode);
                resp = saveData(data);
                _.isFunction(params.success) && params.success(resp);
            } else {
                resp = saveData();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
        break;

      case "delete":
        if (!model.id) {
            params.error(null, "MISSING MODEL ID");
            Ti.API.error("[SQL REST API] ERROR: MISSING MODEL ID");
            return;
        }
        if (-1 == _.indexOf(params.url, "?")) params.url = params.url + "/" + model.id; else {
            var str = params.url.split("?");
            params.url = str[0] + "/" + model.id + "?" + str[1];
        }
        if (DEBUG) {
            Ti.API.info("[SQL REST API] options: ");
            Ti.API.info(params);
        }
        apiCall(params, function(_response) {
            if (_response.success) {
                {
                    parseJSON(_response, parentNode);
                }
                resp = deleteSQL();
                _.isFunction(params.success) && params.success(resp);
            } else {
                resp = deleteSQL();
                _.isUndefined(_response.offline) ? _.isFunction(params.error) && params.error(returnErrorResponse ? _response : resp) : _.isFunction(params.success) && params.success(resp);
            }
        });
    }
}

function encodeData(obj, url) {
    var str = [];
    for (var p in obj) str.push(Ti.Network.encodeURIComponent(p) + "=" + Ti.Network.encodeURIComponent(obj[p]));
    return -1 == _.indexOf(url, "?") ? url + "?" + str.join("&") : url + "&" + str.join("&");
}

function _valueType(value) {
    if ("string" == typeof value) return "'" + value + "'";
    if ("boolean" == typeof value) return value ? 1 : 0;
    return value;
}

function _buildQuery(table, opts) {
    var sql = "SELECT *";
    if (opts.select) {
        sql = "SELECT ";
        sql += _.isArray(opts.select) ? opts.select.join(", ") : opts.select;
    }
    sql += " FROM " + table;
    if (opts.where) {
        var where;
        if (_.isArray(opts.where)) where = opts.where.join(" AND "); else if ("object" == typeof opts.where) {
            where = [];
            where = whereBuilder(where, opts.where);
            where = where.join(" AND ");
        } else where = opts.where;
        sql += " WHERE " + where;
    } else sql += " WHERE 1=1";
    if (opts.like) {
        var like;
        if ("object" == typeof opts.like) {
            like = [];
            _.each(opts.like, function(value, f) {
                like.push(f + ' LIKE "%' + value + '%"');
            });
            like = like.join(" AND ");
            sql += " AND " + like;
        }
    }
    if (opts.likeor) {
        var likeor;
        if ("object" == typeof opts.likeor) {
            likeor = [];
            _.each(opts.likeor, function(value, f) {
                likeor.push(f + ' LIKE "%' + value + '%"');
            });
            likeor = likeor.join(" OR ");
            sql += " AND " + likeor;
        }
    }
    opts.union && (sql += " UNION " + _buildQuery(opts.union));
    opts.unionAll && (sql += " UNION ALL " + _buildQuery(opts.unionAll));
    opts.intersect && (sql += " INTERSECT " + _buildQuery(opts.intersect));
    opts.except && (sql += " EXCEPT " + _buildQuery(opts.EXCEPT));
    if (opts.orderBy) {
        var order;
        order = _.isArray(opts.orderBy) ? opts.orderBy.join(", ") : opts.orderBy;
        sql += " ORDER BY " + order;
    }
    if (opts.limit) {
        sql += " LIMIT " + opts.limit;
        opts.offset && (sql += " OFFSET " + opts.offset);
    }
    return sql;
}

function whereBuilder(where, data) {
    _.each(data, function(v, f) {
        if (_.isArray(v)) {
            var innerWhere = [];
            _.each(v, function(value) {
                innerWhere.push(f + " = " + _valueType(value));
            });
            where.push(innerWhere.join(" OR "));
        } else _.isObject(v) ? where = whereBuilder(where, v) : where.push(f + " = " + _valueType(v));
    });
    return where;
}

function traverseProperties(object, string) {
    var explodedString = string.split(".");
    for (i = 0, l = explodedString.length; l > i; i++) object = object[explodedString[i]];
    return object;
}

function GetMigrationFor(dbname, table) {
    var mid = null;
    var db = Ti.Database.open(dbname);
    db.execute("CREATE TABLE IF NOT EXISTS migrations (latest TEXT, model TEXT);");
    var rs = db.execute("SELECT latest FROM migrations where model = ?;", table);
    if (rs.isValidRow()) var mid = rs.field(0) + "";
    rs.close();
    db.close();
    return mid;
}

function Migrate(Model) {
    var migrations = Model.migrations || [];
    var lastMigration = {};
    migrations.length && migrations[migrations.length - 1](lastMigration);
    var config = Model.prototype.config;
    config.adapter.db_name || (config.adapter.db_name = ALLOY_DB_DEFAULT);
    var migrator = new Migrator(config);
    var targetNumber = "undefined" == typeof config.adapter.migration || null === config.adapter.migration ? lastMigration.id : config.adapter.migration;
    if ("undefined" == typeof targetNumber || null === targetNumber) {
        var tmpDb = Ti.Database.open(config.adapter.db_name);
        migrator.db = tmpDb;
        migrator.createTable(config);
        tmpDb.close();
        return;
    }
    targetNumber += "";
    var currentNumber = GetMigrationFor(config.adapter.db_name, config.adapter.collection_name);
    var direction;
    if (currentNumber === targetNumber) return;
    if (currentNumber && currentNumber > targetNumber) {
        direction = 0;
        migrations.reverse();
    } else direction = 1;
    db = Ti.Database.open(config.adapter.db_name);
    migrator.db = db;
    db.execute("BEGIN;");
    if (migrations.length) for (var i = 0; i < migrations.length; i++) {
        var migration = migrations[i];
        var context = {};
        migration(context);
        if (direction) {
            if (context.id > targetNumber) break;
            if (context.id <= currentNumber) continue;
        } else {
            if (context.id <= targetNumber) break;
            if (context.id > currentNumber) continue;
        }
        var funcName = direction ? "up" : "down";
        _.isFunction(context[funcName]) && context[funcName](migrator);
    } else migrator.createTable(config);
    db.execute("DELETE FROM migrations where model = ?", config.adapter.collection_name);
    db.execute("INSERT INTO migrations VALUES (?,?)", targetNumber, config.adapter.collection_name);
    db.execute("COMMIT;");
    db.close();
    migrator.db = null;
}

function installDatabase(config) {
    var dbFile = config.adapter.db_file;
    var table = config.adapter.collection_name;
    var rx = /^([\/]{0,1})([^\/]+)\.[^\/]+$/;
    var match = dbFile.match(rx);
    if (null === match) throw 'Invalid sql database filename "' + dbFile + '"';
    var dbName = config.adapter.db_name = match[2];
    Ti.API.debug('Installing sql database "' + dbFile + '" with name "' + dbName + '"');
    var db = Ti.Database.install(dbFile, dbName);
    var rs = db.execute('pragma table_info("' + table + '");');
    var columns = {};
    while (rs.isValidRow()) {
        var cName = rs.fieldByName("name");
        var cType = rs.fieldByName("type");
        columns[cName] = cType;
        cName !== ALLOY_ID_DEFAULT || config.adapter.idAttribute || (config.adapter.idAttribute = ALLOY_ID_DEFAULT);
        rs.next();
    }
    config.columns = columns;
    rs.close();
    if (config.adapter.idAttribute) {
        if (!_.contains(_.keys(config.columns), config.adapter.idAttribute)) throw 'config.adapter.idAttribute "' + config.adapter.idAttribute + '" not found in list of columns for table "' + table + '"\ncolumns: [' + _.keys(config.columns).join(",") + "]";
    } else {
        Ti.API.info('No config.adapter.idAttribute specified for table "' + table + '"');
        Ti.API.info('Adding "' + ALLOY_ID_DEFAULT + '" to uniquely identify rows');
        db.execute("ALTER TABLE " + table + " ADD " + ALLOY_ID_DEFAULT + " TEXT;");
        config.columns[ALLOY_ID_DEFAULT] = "TEXT";
        config.adapter.idAttribute = ALLOY_ID_DEFAULT;
    }
    db.close();
}

function S4() {
    return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
}

function guid() {
    return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

var _ = require("alloy/underscore")._, Alloy = require("alloy"), Backbone = Alloy.Backbone, moment = require("alloy/moment");

var ALLOY_DB_DEFAULT = "_alloy_";

var ALLOY_ID_DEFAULT = "alloy_id";

var cache = {
    config: {},
    Model: {},
    URL: null
};

module.exports.beforeModelCreate = function(config, name) {
    if (cache.config[name]) return cache.config[name];
    if ("mobileweb" === Ti.Platform.osname || "undefined" == typeof Ti.Database) throw "No support for Titanium.Database in MobileWeb environment.";
    config.adapter.db_file && installDatabase(config);
    if (!config.adapter.idAttribute) {
        Ti.API.info('No config.adapter.idAttribute specified for table "' + config.adapter.collection_name + '"');
        Ti.API.info('Adding "' + ALLOY_ID_DEFAULT + '" to uniquely identify rows');
        config.columns[ALLOY_ID_DEFAULT] = "TEXT";
        config.adapter.idAttribute = ALLOY_ID_DEFAULT;
    }
    cache.config[name] = config;
    return config;
};

module.exports.afterModelCreate = function(Model, name) {
    if (cache.Model[name]) return cache.Model[name];
    Model || (Model = {});
    Model.prototype.config.Model = Model;
    Model.prototype.idAttribute = Model.prototype.config.adapter.idAttribute;
    Migrate(Model);
    cache.Model[name] = Model;
    return Model;
};

module.exports.sync = Sync;