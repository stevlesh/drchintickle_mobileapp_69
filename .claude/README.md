# 🧠 Claude Code Project Context

This folder contains essential context files that Claude should read at the start of each new conversation to get up to speed on the Dr. ChinTickle project.

## 📋 Quick Start for Claude

When the user says **"get up to speed on my project"**, read these files in order:

1. **`CURRENT_SERVER_ARCHITECTURE.md`** - What's already built server-side
2. **`VIBE_CODING_GUIDE.md`** - User's coding style and collaboration preferences  
3. **`SERVER_FIRST_ARCHITECTURE.md`** - Architecture principles and patterns

## 🎯 Key Context Points

### User Profile: Vibe Coder
- Prefers visual feedback and simple solutions
- Strong with React/UI, needs help with complex server logic
- Values shipping working features over perfect code
- Wants to avoid App Store review cycles

### Architecture Status
- **90% server-first already implemented** ✅
- 10+ RPC functions handling business logic
- 2 Edge Functions with complete workout generation
- Robust security with RLS and auth.uid()
- Client is mostly a beautiful display layer

### Development Pattern
- User describes desired functionality
- Claude implements server-side complexity
- User calls RPCs from client and builds UI
- Focus on iteration over perfection

## 🚨 Important Reminders for Claude

1. **Don't reinvent the wheel** - Check existing RPCs first
2. **Write server code for the user** - They prefer not to write complex SQL
3. **Provide complete client examples** - Show exactly how to use RPCs
4. **Balance ideal vs practical** - Vibe coding constraints are real
5. **Use the Memory MCP** - Store architecture insights across sessions

## 📁 File Purposes

- **`CURRENT_SERVER_ARCHITECTURE.md`** - Audit of existing implementation
- **`VIBE_CODING_GUIDE.md`** - Development style and RPC documentation
- **`SERVER_FIRST_ARCHITECTURE.md`** - Original architectural guidance

## 🔄 Keeping This Updated

When major changes happen:
- Update relevant files in this folder
- Use Memory MCP to store new insights
- Keep this README current with any new patterns

---
*Last updated: Current session - Initial creation of .claude context folder*