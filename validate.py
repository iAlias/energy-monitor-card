#!/usr/bin/env python3
"""Simple validation script for Energy Monitor Backend integration."""

import sys
import json
from pathlib import Path

def validate_manifest():
    """Validate manifest.json structure."""
    print("🔍 Validating manifest.json...")
    
    manifest_path = Path("custom_components/energy_monitor_backend/manifest.json")
    
    if not manifest_path.exists():
        print("❌ manifest.json not found!")
        return False
    
    with open(manifest_path) as f:
        manifest = json.load(f)
    
    required_fields = ["domain", "name", "version", "documentation"]
    for field in required_fields:
        if field not in manifest:
            print(f"❌ Missing required field: {field}")
            return False
    
    if manifest["domain"] != "energy_monitor_backend":
        print(f"❌ Invalid domain: {manifest['domain']}")
        return False
    
    print(f"✅ Manifest valid: {manifest['name']} v{manifest['version']}")
    return True


def validate_const():
    """Validate const.py can be imported."""
    print("\n🔍 Validating const.py...")
    
    try:
        import importlib.util
        
        const_path = Path("custom_components/energy_monitor_backend/const.py")
        spec = importlib.util.spec_from_file_location("const", const_path)
        if spec is None or spec.loader is None:
            print("❌ Could not load const.py module spec")
            return False
        
        const = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(const)
        
        required_attrs = [
            "DOMAIN", "NAME", "VERSION",
            "API_BASE_PATH", "ENDPOINT_ENTITIES", "ENDPOINT_STATE", "ENDPOINT_HISTORY",
            "INVALID_STATES"
        ]
        
        for attr in required_attrs:
            if not hasattr(const, attr):
                print(f"❌ Missing constant: {attr}")
                return False
        
        print(f"✅ Constants valid: {const.DOMAIN}")
        print(f"   API endpoints: {const.ENDPOINT_ENTITIES}, {const.ENDPOINT_STATE}, {const.ENDPOINT_HISTORY}")
        return True
        
    except Exception as e:
        print(f"❌ Error importing const.py: {e}")
        return False


def validate_init():
    """Validate __init__.py structure."""
    print("\n🔍 Validating __init__.py...")
    
    init_path = Path("custom_components/energy_monitor_backend/__init__.py")
    
    if not init_path.exists():
        print("❌ __init__.py not found!")
        return False
    
    with open(init_path) as f:
        content = f.read()
    
    required_strings = [
        "async def async_setup",
        "class EntitiesView",
        "class StateView", 
        "class HistoryView",
        "HomeAssistantView",
        "hass.http.register_view"
    ]
    
    for required in required_strings:
        if required not in content:
            print(f"❌ Missing required code: {required}")
            return False
    
    print("✅ __init__.py structure valid")
    print("   Views: EntitiesView, StateView, HistoryView")
    return True


def validate_file_structure():
    """Validate directory structure."""
    print("\n🔍 Validating file structure...")
    
    required_files = [
        "custom_components/energy_monitor_backend/__init__.py",
        "custom_components/energy_monitor_backend/const.py",
        "custom_components/energy_monitor_backend/manifest.json",
        "dist/energy-monitor-card.js",
        "BACKEND-README.md",
        "INSTALLATION.md",
        "README.md"
    ]
    
    all_exist = True
    for filepath in required_files:
        path = Path(filepath)
        if path.exists():
            print(f"✅ {filepath}")
        else:
            print(f"❌ {filepath} - NOT FOUND")
            all_exist = False
    
    return all_exist


def main():
    """Run all validations."""
    print("=" * 60)
    print("Energy Monitor Backend - Validation Script")
    print("=" * 60)
    
    results = []
    results.append(("Manifest", validate_manifest()))
    results.append(("Constants", validate_const()))
    results.append(("Init Module", validate_init()))
    results.append(("File Structure", validate_file_structure()))
    
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    
    all_passed = True
    for name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{name:20s}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All validations passed! Integration is ready.")
        return 0
    else:
        print("\n⚠️  Some validations failed. Please review the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
