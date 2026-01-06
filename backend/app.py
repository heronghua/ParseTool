from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import traceback

app = Flask(__name__)
# 允许跨域请求
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({"status": "ok", "service": "JSON Parser API"})

@app.route('/api/parse', methods=['POST'])
def parse_json():
    """解析JSON接口"""
    try:
        # 获取请求数据
        data = request.get_json()
        
        if not data:
            return jsonify({
                "success": False,
                "error": "没有接收到数据",
                "result": None
            }), 400
        
        json_string = data.get('json_string', '')
        options = data.get('options', {})
        
        if not json_string:
            return jsonify({
                "success": False,
                "error": "JSON字符串不能为空",
                "result": None
            }), 400
        
        # 解析JSON
        parsed_data = json.loads(json_string)
        
        # 根据选项处理数据
        if options.get('pretty', False):
            # 美化输出（这里可以添加自定义美化逻辑）
            pass
        
        if options.get('validate', False):
            # 验证数据（这里可以添加验证逻辑）
            pass
        
        # 统计信息
        stats = {
            "type": type(parsed_data).__name__,
            "length": len(parsed_data) if isinstance(parsed_data, (list, dict)) else 1,
            "keys": list(parsed_data.keys()) if isinstance(parsed_data, dict) else []
        }
        
        return jsonify({
            "success": True,
            "result": parsed_data,
            "stats": stats,
            "original_length": len(json_string),
            "parsed_length": len(str(parsed_data))
        })
        
    except json.JSONDecodeError as e:
        return jsonify({
            "success": False,
            "error": f"JSON解析错误: {str(e)}",
            "line": e.lineno,
            "column": e.colno,
            "result": None
        }), 400
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"服务器错误: {str(e)}",
            "result": None
        }), 500

@app.route('/api/format', methods=['POST'])
def format_json():
    """格式化JSON接口"""
    try:
        data = request.get_json()
        json_string = data.get('json_string', '')
        
        parsed = json.loads(json_string)
        formatted = json.dumps(parsed, indent=2, ensure_ascii=False)
        
        return jsonify({
            "success": True,
            "formatted": formatted,
            "original_length": len(json_string),
            "formatted_length": len(formatted)
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "formatted": None
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)